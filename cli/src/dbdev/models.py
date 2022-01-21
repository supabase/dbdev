from typing import Any, Dict

import jsonschema
from jsonschema.exceptions import ValidationError

# SPEC: database.json
SCHEMA = {
    "type": "object",
    "properties": {
        "name": {
            "type": "string",
            "pattern": "^[A-z][A-z0-9\_]{2,14}/[A-z][A-z0-9\_]{2,14}$",
        },
        "version": {"type": "string"},  # TODO: regex
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
    x = jsonschema.validate(contents, SCHEMA)
    return contents
