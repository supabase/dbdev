from typing import Any, Dict

import jsonschema

# SPEC: database.json
SCHEMA = {
    "type": "object",
    "properties": {
        "name": {
            "type": "string",
            "pattern": r"^[A-z][A-z0-9\_]{2,14}/[A-z][A-z0-9\_]{2,14}$",
        },
        "version": {
            "type": "string",
            # https://semver.org/
            "pattern": r"^(?P<major>0|[1-9]\d*)\.(?P<minor>0|[1-9]\d*)\.(?P<patch>0|[1-9]\d*)(?:-(?P<prerelease>(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+(?P<buildmetadata>[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$",
        },
        "source": {
            "type": "array",
            "items": {"type": "string"},
            "minItems": 1,  # TBD
            "maxItems": 1,  # TBD
        },
    },
    "required": ["name", "version"],
}


def validate_database_json(contents: Dict[str, Any]) -> Dict[str, Any]:
    """Validates that the database.json file is valid"""
    _ = jsonschema.validate(contents, SCHEMA)
    return contents
