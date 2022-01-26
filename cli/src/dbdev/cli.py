import datetime as dt
import json
import re
from pathlib import Path
from typing import Literal, Optional

import dotenv
import httpx
import typer
from dbdev.models import validate_database_json
from gotrue.exceptions import APIError

from dbdev import config, prompt
from supabase import Client, create_client

dotenv.load_dotenv()
app = typer.Typer()


@app.command()
def sign_up() -> None:
    """Create a user account"""
    client: Client = create_client(config.URL, config.ANON_KEY)

    email_address = prompt.email_address()
    password = prompt.password(confirm=True)

    while True:
        handle = prompt.handle()

        # Check handle availability
        resp = client.rpc(
            fn="is_handle_available",
            params={
                "handle": handle,
            },
        )
        if resp.text == "true":
            break
        elif resp.status_code != 200:
            typer.echo(resp.json()["message"])
        else:
            typer.echo(f"Requested handle unavailable. Try again")

    try:
        user = client.auth.sign_up(
            email=email_address, password=password, data={"handle": handle}
        )
    except APIError as exc:
        typer.echo(f"An error occured")
        typer.echo(exc.msg)
        raise typer.Abort()

    typer.echo(f"Successfully created account {handle} ({email_address})")


def storage_package_version_key(
    package_handle: str, partial_name: str, version: str
) -> str:
    """Create the Storage API file key"""
    return f"{package_handle}/{partial_name}/{version}.sql"


@app.command()
def publish(path: Path = Path(config.PACKAGE_CONFIG)) -> None:
    """Upload a pacakge to the package index"""

    if not path.is_file():
        typer.echo(f"{config.PACKAGE_CONFIG} not found")
        raise typer.Abort()

    contents = json.loads(path.read_text())

    try:
        contents = validate_database_json(contents)
        package_version_source_path = contents["source"][0]
        package_version = contents["version"]
        package_handle, _, partial_package_name = contents["name"].partition("/")
        assert Path(package_version_source_path).is_file()
    except Exception as exc:
        typer.echo(f"Error while validating {config.PACKAGE_CONFIG}")
        typer.echo(exc)
        raise typer.Abort()

    email_address = prompt.email_address()
    password = prompt.password()

    anon_client: Client = create_client(config.URL, config.ANON_KEY)
    try:
        session = anon_client.auth.sign_in(email=email_address, password=password)
    except APIError as exc:
        typer.echo(exc.msg)
        raise typer.Abort()

    # Using access token as apiKey because of the (incorrect) way headers are set for storage client
    storage_client = (
        create_client(config.URL, session.access_token)
        .storage()
        .StorageFileAPI(id_=config.PACKAGE_VERSION_BUCKET)
    )

    storage_object_name = storage_package_version_key(
        package_handle=package_handle,
        partial_name=partial_package_name,
        version=package_version,
    )

    storage_resp = storage_client.upload(
        path=storage_object_name,
        file=package_version_source_path,
    )

    if storage_resp.status_code != 200:
        typer.echo(storage_resp.json()["message"])
        raise typer.Abort()

    headers = {
        "authorization": f"Bearer {session.access_token}",
        "apiKey": config.ANON_KEY,
    }
    base_url = config.URL + "/rest/v1/"

    resp = httpx.post(
        base_url + "rpc/publish_package_version",
        headers=headers,
        json={"body": contents, "object_name": storage_object_name},
    )

    if resp.status_code != 200:
        typer.echo(storage_resp.json()["message"])
        raise typer.Abort()

    typer.echo(f"Successfully published pacakge {contents['name']}")
