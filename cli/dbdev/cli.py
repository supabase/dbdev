from typing import Literal, Optional
from pathlib import Path
import datetime as dt
import json
import typer

from supabase import create_client, Client

app = typer.Typer()

URL: str = 'http://localhost:54321'
ANON_KEY: str = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.ZopqoUt20nEV9cklpv9e3yw3PVyZLmKs5qLD6nGL1SI'

PACKAGE_CONFIG = 'package.json'

@app.command()
def sign_up() -> None:
    """Upload a pacakge to the package index"""

    email_address = typer.prompt("email")
    password = typer.prompt("password", hide_input=True)
    confirm_password = typer.prompt("Confirm password", hide_input=True)

    handle = typer.prompt("Handle (ex: jsmith)")
    # TODO check if available and prompt if not
    # TODO is valid

    if not password == confirm_password:
        typer.echo(f"Passwords did not match")
        raise typer.Abort()

    client: Client = create_client(URL, ANON_KEY)
    response = client.auth.sign_up(
        email=email_address,
        password = password,
        data=json.dumps({"handle": handle})
    )









@app.command()
def publish(path: Path = Path(PACKAGE_CONFIG)) -> None:
    """Upload a pacakge to the package index"""

    if not path.is_file():
        typer.echo(f"{PACKAGE_CONFIG} not found")
        raise typer.Abort()

    contents = path.read_text()

    account_ref = typer.prompt("Email")
    password = typer.prompt("Password", hide_input=True)

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
