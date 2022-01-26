import os
import re

import typer

from dbdev import config

VALID_NAME_REGEX = re.compile("^[A-z][A-z0-9\_]{2,14}$")
EMAIL_ADDRESS_REGEX = re.compile(
    "^[a-zA-Z0-9.!#$%&"
    "*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$"
)
MIN_PASSWORD_LENGTH = 7


def email_address() -> str:
    """Prompt user for valid email address"""

    while True:
        email_address = os.environ.get(config.ENV_DBDEV_EMAIL) or typer.prompt("Email")

        if not EMAIL_ADDRESS_REGEX.match(email_address):
            typer.echo("Invalid email address")
            continue

        return email_address


def password(confirm: bool = False) -> str:
    """Prompt user for password"""

    while True:
        password = os.environ.get(config.ENV_DBDEV_PASSWORD) or typer.prompt(
            "Password", hide_input=True
        )

        if len(password) <= MIN_PASSWORD_LENGTH:
            typer.echo(f"Password too short")
            continue

        if confirm and not password == os.environ.get(config.ENV_DBDEV_PASSWORD):
            confirm_password = typer.prompt("Confirm password", hide_input=True)

            if not password == confirm_password:
                typer.echo(f"Passwords did not match")
                continue

        return password


def handle() -> str:
    """Prompt user for handle"""

    while True:
        handle = typer.prompt("Handle (ex: j_smith)")

        if not VALID_NAME_REGEX.match(handle):
            typer.echo(
                """Invalid handle
Rules
-----
- Starts with a letter
- Characters: A-z 0-9 _
- Length: 0-15 charactrs"""
            )
            continue

        return handle
