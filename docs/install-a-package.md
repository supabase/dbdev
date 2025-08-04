You can install extensions available on the database.dev registry using the dbdev CLI's `add` command. The dbdev client is itself an extension which you can install by following the instructions below.

## Pre-requisites

Before you can install a package, ensure you have the `pg_tle` extension installed in your database.

!!! note

    If your database is running on Supabase, `pg_tle` is already installed.

!!! warning

    Restoring a logical backup of a database with a TLE installed can fail. For this reason, dbdev should only be used with databases with physical backups enabled.

```sql
create extension if not exists pg_tle;
```

## Use

Once the prerequisites are met, you can create a migration file to install a TLE available on database.dev by running the following dbdev command:

```bash
dbdev add -c <postgres_connection_string> -o <output_file> <extension_name>
```

For example, to install pg_headerkit version 1.0.0 in schema public run:

```sql
select dbdev.install('burggraf-pg_headerkit');
create extension "burggraf-pg_headerkit"
    schema 'public'
    version '1.0.0';
```
