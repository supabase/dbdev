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
- comment (string). Think of this as the description of the extension.
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

## Script Files

Script files contain the SQL objects to be created by the extension.
