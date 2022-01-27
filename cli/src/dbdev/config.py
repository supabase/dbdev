import os
from functools import lru_cache

# Constant
PACKAGE_CONFIG = "database.json"
PACKAGE_VERSION_BUCKET = "package_versions"

# Environment Variable Names
ENV_DBDEV_URL: str = "DBDEV_URL"  # can be hard coded in release
ENV_DBDEV_ANON_KEY: str = "DBDEV_ANON_KEY"  # can be hard coded in release
ENV_DBDEV_EMAIL = "DBDEV_EMAIL"
ENV_DBDEV_PASSWORD = "DBDEV_PASSWORD"


@lru_cache()
def get_anon_key() -> str:
    f"""Get the anon apiKey from environment variable {ENV_DBDEV_ANON_KEY}"""
    key = os.getenv(ENV_DBDEV_ANON_KEY)
    if key is None:
        raise KeyError(
            f"Expected environment variable {ENV_DBDEV_ANON_KEY} to contain an `apiKey`. Export the variable or add it to a .env file in the current directory"
        )
    return key


@lru_cache()
def get_url() -> str:
    f"""Get the api base URL rom environment variable {ENV_DBDEV_URL}
    Ex: "http://localhost:54321"
    """
    url = os.getenv(ENV_DBDEV_URL)

    if url is None:
        raise KeyError(
            f"Expected environment variable {ENV_DBDEV_URL} to contain a `url`. Export the variable or add it to a .env file in the current directory"
        )

    if url.endswith("/"):
        url = url[:-1]
    return url
