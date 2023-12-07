You can install extensions available on the database.dev registry using the dbdev in-database client. The dbdev client is itself an extension which you can install by following the instructions below.

## Installation

Before you can install the dbdev extension into your database, ensure you have the following dependencies already installed:

- [pg_tle](https://github.com/aws/pg_tle)
- [pgsql-http](https://github.com/pramsey/pgsql-http)

!!! note

    If you database is running on Supabase, the above dependencies are already installed.

Run the following SQL to install the client:

```sql
create extension if not exists http with schema extensions;
create extension if not exists pg_tle;
-- drop dbdev with older naming scheme if present
drop extension if exists "supabase-dbdev";
select pgtle.uninstall_extension_if_exists('supabase-dbdev');
drop extension if exists "supabase@dbdev";
select pgtle.uninstall_extension_if_exists('supabase@dbdev');
select
    pgtle.install_extension(
        'supabase@dbdev',
        resp.contents ->> 'version',
        'PostgreSQL package manager',
        resp.contents ->> 'sql'
    )
from http(
    (
        'GET',
        'https://api.database.dev/rest/v1/'
        || 'package_versions?select=sql,version'
        || '&package_name=eq.supabase@dbdev'
        || '&order=version.desc'
        || '&limit=1',
        array[
            ('apiKey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtdXB0cHBsZnZpaWZyYndtbXR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODAxMDczNzIsImV4cCI6MTk5NTY4MzM3Mn0.z2CN0mvO2No8wSi46Gw59DFGCTJrzM0AQKsu_5k134s')::http_header
        ],
        null,
        null
    )
) x,
lateral (
    select
        ((row_to_json(x) -> 'content') #>> '{}')::json -> 0
) resp(contents);
create extension "supabase@dbdev";
select dbdev.install('supabase@dbdev');
drop extension if exists "supabase@dbdev";
create extension "supabase@dbdev";
```

## Use

Once the client is installed, you an install a TLE available on database.dev by running SQL that looks like the following:

```sql
select dbdev.install(<extension_name>);
create extension <extension_name>
    schema <schema>
    version <version>;
```

For example, to install pg_headerkit version 1.0.0 in schema public run:

```sql
select dbdev.install('burggraf@pg_headerkit');
create extension "burggraf@pg_headerkit"
    schema 'public'
    version '1.0.0';
```
