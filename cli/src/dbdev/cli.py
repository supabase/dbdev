import datetime as dt
import json
import re
from pathlib import Path
from typing import Literal, Optional

import typer
from dbdev.models import validate_database_json
from gotrue.exceptions import APIError

from dbdev import config, prompt
from supabase import Client, create_client

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

    # TODO: read from env if present
    email_address = prompt.email_address()
    password = prompt.password()

    try:
        anon_client: Client = create_client(config.URL, config.ANON_KEY)
        session = anon_client.auth.sign_in(email=email_address, password=password)
        client: Client = create_client(config.URL, session.access_token)
    except APIError as exc:
        typer.echo(exc.msg)
        raise typer.Abort()

    # upload to storage
    # TODO fails with 400: row level security policy
    storage_client = client.storage().StorageFileAPI(id_="package_versions")
    resp = storage_client.upload(
        path=f"package_version/{package_handle}/{partial_package_name}/{package_version}",
        file=package_version_source_path,
    )
    import pdb

    pdb.set_trace()

    try:
        resp = client.rpc(
            fn="publish_package_version", params={"body": contents, "object_id": None}
        )
    except APIError as exc:
        typer.echo(exc.msg)
        raise typer.Abort()

    typer.echo(f"Successfully published pacakge")
