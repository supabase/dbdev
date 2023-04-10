# dbdev

dbdev is a package manager for PostgreSQL [trusted language extensions](https://github.com/aws/pg_tle). At this time the registry is limited to a handful of pre-loaded pglets (short for postgres applets, pronounced piglet). In the coming weeks we'll enable third party contributions.

For more info, check out the [dbdev release blog post](https://supabase.com/blog/dbdev-package-manager) or start searching for packages are [database.dev](database.dev).


## UX

Users primarily interact with the registry using the dbdev SQL client. Once present, pglets can be installed as follows:

```sql
-- Load the package from the package index
select dbdev.install('olirice-index_advisor');
```
Where `olirice` is the handle of the publisher and `index_advisor` is the name of the pglet.

Once installed, pglets are visible in PostgreSQL as extensions. At that point they can be enabled with standard Postgres commands i.e. the `create extension`

To improve reproducibility, we recommend __always__ specifying the package version in your `create extension` statements.

For example:
```sql
-- Enable the extension
create extension "olirice-index_advisor"
    schema 'public'
    version '0.1.0';
```

Which creates all tables/indexes/functions/etc specified by the extension.

## Install the Client in Postgres

The in-database SQL client for the package registry is named `dbdev`. You can bootstrap the client with:

```sql
/*---------------------
---- install dbdev ----
----------------------
Requires:
  - pg_tle: https://github.com/aws/pg_tle
  - pgsql-http: https://github.com/pramsey/pgsql-http
*/
create extension if not exists http with schema extensions;
create extension if not exists pg_tle;
select pgtle.uninstall_extension_if_exists('supabase-dbdev');
drop extension if exists "supabase-dbdev";
select
    pgtle.install_extension(
        'supabase-dbdev',
        resp.contents ->> 'version',
        'PostgreSQL package manager',
        resp.contents ->> 'sql'
    )
from http(
    (
        'GET',
        'https://api.database.dev/rest/v1/'
        || 'package_versions?select=sql,version'
        || '&package_name=eq.supabase-dbdev'
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
create extension "supabase-dbdev";
select dbdev.install('supabase-dbdev');
drop extension if exists "supabase-dbdev";
create extension "supabase-dbdev";
```

With the client ready, search for packages on [database.dev](database.dev) and install them
```sql
select dbdev.install('handle-package_name');
create extension "handle-package_name"
    schema 'public'
    version '1.2.3';
```

## Developers

The [`supabase/dbdev`](https://github.com/supabase/dbdev) repository hosts the source code for both the database.dev package registry and its accompanying website. It also hosts the work-in-progress CLI for authors manage their packages.

### Package Registry

The package registry `supabase/`, is a [Supabase](https://supabase.com) project where accounts, organizations, and packages are normalized into database tables. For more info of the registry, see the [architecture](#architecture) section

Requires:
- [Supabase CLI](https://github.com/supabase/cli)
- [docker](https://www.docker.com/)

```
supabase start
```

which returns a set of endpoints for each service

```text
supabase local development setup is running.

         API URL: http://localhost:54321
     GraphQL URL: http://localhost:54321/graphql/v1
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
      JWT secret: SECRET
        anon key: KEY
service_role key: KEY
```


### Website (database.dev)

The website/ directory contains a Next.js project, which serves as the visual interface for users to interact with the registry.

Requires:
- [node 14+](https://nodejs.org/en)


```
cd website
npm install
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000)


### CLI

Coming soon in the `cli/` directory

### Architecture

- The core tables are located in the `app` schema.
- The public API is located in the `public` schema.

![ERD](assets/erd.png)
