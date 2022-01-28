# dbdev CLI

The `dbdev` python CLI is a WIP reference implementation for the dbdev package index.


## Setup

Requires:

- Python 3.10
```sh
$ brew install python@3.10
```

### Installation

Create and activate a virtual environment
```sh
$ python3.10 -m venv venv
```

Activate the virtual environmentt
```
$ source venv/bin/activate
```

Install dbdev in the Environment
```
cd cli/
$ pip install -e .
```
The `dbdev` command should now be available

## Usage

```sh
$ dbdev --help

Usage: dbdev [OPTIONS] COMMAND [ARGS]...

Options:
  --install-completion  Install completion for the current shell.
  --show-completion     Show completion for the current shell, to copy it or
                        customize the installation.
  --help                Show this message and exit.

Commands:
  get      Download a package version
  publish  Upload a pacakge to the package index
  sign-up  Create a user account
```

### sign-up
```
$ dbdev sign-up --help

Usage: dbdev sign-up [OPTIONS]

  Create a user account

Options:
  --help  Show this message and exit.
```

### publish
```
$ dbdev publish --help

Usage: dbdev publish [OPTIONS]

  Upload a pacakge to the package index

Options:
  --path PATH  [default: database.json]
  --help       Show this message and exit.
```

### get 
```
$ dbdev get --help

Usage: dbdev get [OPTIONS] PACKAGE_NAME

  Download a package version's source code

Arguments:
  PACKAGE_NAME  [required]

Options:
  --version TEXT
  --help          Show this message and exit.
```

## Example

Head over to [the example pacakge](/examples/math) for an end-to-end example 
- creating a user account
- publishing a package
- retreiving the pacakge