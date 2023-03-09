# dbdev cli

CLI tooling for creating, publishing, and installing [TLE](https://github.com/aws/pg_tle) packages.

Note that this tooling is primarily intended for package authors. There is a WIP TLE package that will be pre-installed in the database (or installed via this CLI) that will be the main way end-users fetch packages into their database. For example:

Once the `dbdev` TLE is installed
```sql
select dbdev.install('math', '0.0.1');
```

Where the `dbdev` CLI functions as a backup solution for installing packages when requirements for the `dbdev` TLE are not met (no [pgsql-http](https://github.com/pramsey/pgsql-http))
```
dbdev install --connection 'postgresql://...' --package 'math' --version '0.0.1'
```

## Objective Statements

As a package author, I want to:
- install extensions from a local directory into a database
- sign up for an account with a package index
- publish extensions to a package index

As an end user, I want to:
- install the TLE that enables remotely installing packages from the dbdev package index
- install extensions from a package index into a database (a backup solution the dbdev TLE is not available in the database)
- uninstall extensions from a database

## Interface

```sh
Usage: dbdev [OPTIONS] <COMMAND>

Commands:
  install    Install a package to a database
  uninstall  Uninstall a package from a database
  help       Print this message or the help of the given subcommand(s)

<NOT IMPLEMENTED>
  signup    Create a user account
  publish    Upload a package to the package index

Options:
  -d, --debug    Turn debugging information on
  -h, --help     Print help
  -V, --version  Print version
```

### install

```
Install a package to a database

Usage: dbdev install [OPTIONS] --connection <CONNECTION>

Options:
  -c, --connection <CONNECTION>  PostgreSQL connection string
  -p, --package <PACKAGE>        Package name on package index
      --path <PATH>              From local directory
  -h, --help                     Print help
```

### uninstall

```
Uninstall a package from a database

Usage: dbdev uninstall --connection <CONNECTION> --package <PACKAGE>

Options:
  -c, --connection <CONNECTION>  PostgreSQL connection string
  -p, --package <PACKAGE>        Package name on dbdev package index
  -h, --help                     Print help
```

### signup (NOT IMPLEMENTED)

```
Create a user account

Usage: dbdev signup <HANDLE>

Arguments:
  <HANDLE>  PostgreSQL connection string

Options:
  -h, --help  Print help
```

The user is additionally prompted for an email address and password during signup. Packages can not be uploaded to an account until the email address is confirmed.

### publish (NOT IMPLEMENTED)

```
Upload a package to the package index

Usage: dbdev publish

Options:
  -h, --help  Print help
```

Publishes the current directory's TLE package to the package index.
