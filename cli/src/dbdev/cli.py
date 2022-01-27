import datetime as dt
import json
import re
from pathlib import Path
from typing import Any, Dict, List, Literal, Optional, Tuple, Union

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
    client: Client = create_client(config.get_url(), config.get_anon_key())

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
        _ = client.auth.sign_up(
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

    anon_client: Client = create_client(config.get_url(), config.get_anon_key())
    try:
        session = anon_client.auth.sign_in(email=email_address, password=password)
    except APIError as exc:
        typer.echo(exc.msg)
        raise typer.Abort()

    # Using access token as apiKey because of the (incorrect) way headers are set for storage client
    storage_client = (
        create_client(config.get_url(), session.access_token)
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
        "apiKey": config.get_anon_key(),
    }
    base_url = config.get_url() + "/rest/v1/"

    resp = httpx.post(
        base_url + "rpc/publish_package_version",
        headers=headers,
        json={"body": contents, "object_name": storage_object_name},
    )

    if resp.status_code != 200:
        typer.echo(storage_resp.json()["message"])
        raise typer.Abort()

    typer.echo(f"Successfully published pacakge {contents['name']}")


@app.command()
def get(package_name: str, version: Optional[str] = None) -> None:
    """Download a package version's source code"""

    # postgrest-py incorrectly url encodes variables for postgrest
    url = f"{config.get_url()}/rest/v1/package_versions"
    url += f"?package_name=eq.{package_name}"
    if version:
        url += f"&version=eq.{version}"
    url += "&order=version.desc.nullslast"
    url += "&limit=1"

    headers = {
        "apiKey": config.get_anon_key(),
    }

    rows: List[Dict[str, Any]] = httpx.get(url=url, headers=headers).json()

    if len(rows) == 0:
        typer.echo(
            f"No package version found for {package_name}" + f" {version}"
            if version
            else ""
        )
        raise typer.Abort()

    assert len(rows) == 1
    version_row = rows[0]

    object_name = version_row["object_key"]
    anon_client: Client = create_client(config.get_url(), config.get_anon_key())
    storage_client = anon_client.storage().StorageFileAPI(
        id_=config.PACKAGE_VERSION_BUCKET
    )

    package_src = storage_client.download(path=object_name)

    # may differ in capitalization due to citext
    row_package_name = version_row["package_name"]
    row_version = version_row["version"]

    # TODO: decide on a header comment format?
    typer.echo(
        f"""/*
    package: {row_package_name}
    version: {row_version}
*/"""
    )
    typer.echo(package_src)
