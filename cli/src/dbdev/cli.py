from typing import Literal, Optional
from pathlib import Path
import datetime as dt
import json
from gotrue.exceptions import APIError
from dbdev import prompt
import typer
import re

from supabase import create_client, Client

app = typer.Typer()

#URL: str = 'http://localhost:54321'
#ANON_KEY: str = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.ZopqoUt20nEV9cklpv9e3yw3PVyZLmKs5qLD6nGL1SI'

URL: str = 'https://sevhkikssrcxrzsyzvmv.supabase.co'
ANON_KEY: str = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQyNTkyODU1LCJleHAiOjE5NTgxNjg4NTV9.Yrx9KBPKDYllxXaXr2DHWgGY_ANK8NV7d_4D0xM1uyc'

PACKAGE_CONFIG = 'package.json'

@app.command()
def sign_up() -> None:
    """Upload a pacakge to the package index"""
    client: Client = create_client(URL, ANON_KEY)

    email_address = prompt.email_address()
    password = prompt.password(confirm=True)

    while True:
        handle = prompt.handle()

        # Check handle availability
        resp = client.rpc(
            fn='is_handle_available',
            params={
                "handle": handle,
            }
        )
        if resp.text == 'true' :
            break
        elif resp.status_code != 200:
            typer.echo(resp.json()["message"])
        else:
            typer.echo(f"Requested handle unavailable. Try again")

    try:
        user = client.auth.sign_up(
            email=email_address,
            password = password,
            data={"handle": handle}
        )
    except APIError as exc:
        typer.echo(f"An error occured")
        typer.echo(exc.msg)
        raise typer.Abort()

    typer.echo(f"Successfully created account {handle} ({email_address})")


@app.command()
def publish(path: Path = Path(PACKAGE_CONFIG)) -> None:
    """Upload a pacakge to the package index"""

    if not path.is_file():
        typer.echo(f"{PACKAGE_CONFIG} not found")
        raise typer.Abort()

    contents = json.loads(path.read_text())
    email_address = prompt.email_address()
    password = prompt.password()

    # TODO: upload to storage
    # TODO: upload version


@app.command()
def get(
        package_name: str,
        version: Optional[str],
        include_dependencies: bool = True
    ) -> None:
    """Get package from the package index"""
    client: Client = create_client(URL, ANON_KEY)

    resp = (
            client
            .table("package_versions")
            .select("*")
            .execute()
    )

    # TODO filter by version, supporting semver nonsense
    typer.echo(resp)


@app.command()
def install(as_of: Optional[str] = None) -> None:
    """Install package dependencies"""
    client: Client = create_client(URL, ANON_KEY)

    # reads dependencies from package.json
    # sends them w/ params to DB to resolve
    # if dependencies are not resolvable, abort
    # collects best version

    #


if __name__ == "__main__":
    app()
