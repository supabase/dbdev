#!/usr/bin/env python
import logging
import os
import sys

import setuptools

PACKAGE_NAME = "dbdev"
MINIMUM_PYTHON_VERSION = (3, 10, 0, "", 0)


def check_python_version():
    """Exit when the Python version is too low."""
    if sys.version_info < MINIMUM_PYTHON_VERSION:
        sys.exit(
            "At least Python {0}.{1}.{2} is required.".format(
                *MINIMUM_PYTHON_VERSION[:3]
            )
        )


def read_package_variable(key, filename="__init__.py") -> str:
    """Read the value of a variable from the package without importing."""
    module_path = os.path.join("src", PACKAGE_NAME, filename)
    with open(module_path) as module:
        for line in module:
            parts = line.strip().split(" ", 2)
            if parts[:-1] == [key, "="]:
                return parts[-1].strip("'").strip('"')
    raise Exception("package variable not found")


check_python_version()


DEV_REQUIRES = [
    "pytest",
    "pre-commit",
    "pylint",
    "black",
    "mypy",
]


ext_modules = []

setuptools.setup(
    name=read_package_variable("__project__"),
    version=read_package_variable("__version__"),
    description="dbdev package manager cli",
    url="https://github.com/supabase/dbdev",
    author="Supabase",
    packages=setuptools.find_packages("src", exclude=["test"]),
    package_dir={"": "src"},
    entry_points={
        "console_scripts": [
            "dbdev = dbdev.cli:app",
        ]
    },
    classifiers=[
        "Development Status :: 4 - Beta",
        "Natural Language :: English",
        "Operating System :: OS Independent",
        "Programming Language :: Python",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.10",
    ],
    install_requires=[
        "typer[all]==0.4.0",
        "appdirs==1.4.4",
        "supabase==0.3.0",
        "jsonschema==4.4.0",
    ],
    extras_require={"dev": DEV_REQUIRES},
)
