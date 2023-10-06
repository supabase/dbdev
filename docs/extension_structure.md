A Postgres [trusted lanuguage extension](https://github.com/aws/pg_tle) (TLE) consists of the following files:

1. Script files. These files contain the SQL commands to create the extension's objects.
2. Control files. These files contain basic properties of the extension itself.

For an extension to be valid, one file of each type must be present in an extension. For example, if you want to create an extension named `my-extension`, create the following folder structure:

- my-extension
    - my-extension.control
    - my-extension--0.0.1.sql

In the above example, the `my-extension` folder contains the extension files. Names of the files are important. The control file should be named `<extension_name>.control` and the script file should be named `<extension_name>--<extension_version>.sql`.

## Control Files

A control file contains metadata about the extension in key-value pairs. The most common keys that you should consider setting are the following:

- default_version (string). The version to use if the user doesn't provide one in the `create extension` command.
- comment (string). A comment added to the extension object created in the database.
- requires (string). A comma separated list of extensions that this extension depends on.
- relocatable (boolean). Set to true if the extension's objects can be moved to a different schema after they are created.
- superuser (boolean). Set to true if only superusers should be able to create this extension.

For example, the [pgjwt extension's control file](https://github.com/michelp/pgjwt/blob/master/pgjwt.control) looks like this:

```control
# pgjwt extension
comment = 'JSON Web Token API for Postgresql'
default_version = '0.2.0'
relocatable = false
requires = pgcrypto
superuser = false
```

For a complete list of keys available in a control file, refer to [Postgres documentation](https://www.postgresql.org/docs/current/extend-extensions.html#EXTEND-EXTENSIONS-FILES).

!!! note

    A control file should only contain plain ASCII characters.

## Script Files

Script files contain the SQL commands to create or modify database objects. These database objects can be, but are not limited to, tables, views, functions, types, operators etc. For example, the [pgjwt's `pgjwt--0.1.1.sql` file](https://github.com/michelp/pgjwt/blob/master/pgjwt--0.1.1.sql) contains definitions for functions which the extension adds to the database. One exception to the SQL command which can exist in a script file are transaction control commands like `BEGIN`, `COMMIT`, `ROLLBACK` etc.

You might have noticed a strange line at the beginning of the [`pgjwt-0.1.1.sql` file](https://github.com/michelp/pgjwt/blob/master/pgjwt--0.1.1.sql) starting with `\echo`. This line prevents the script file from being run accidentally in `psql`. Lines starting with `\echo` are run only in `psql` but are ignored when the script file is executed by the [`CREATE EXTENSION` command](https://www.postgresql.org/docs/current/sql-createextension.html). It is recommended that you include such a line at the beginning of your script file.

### Update Scripts

Update scripts are used to update an installed extension. An update script should be named `<extension_name>--<old_version>--<new_version>.sql`. For example if version `1.0` of `my-extension` was published already and you want to publish a new version `1.1` you need to create `my-extension--1.0--1.1.sql`. Update scripts can create new database object or modify/delete existing objects created by the previous version of the extension.
