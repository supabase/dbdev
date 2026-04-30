# Developers

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

The *API URL* and *anon key* values will be used in the next section to setup environment variables.

### Schema management (declarative)

The repo supports a **declarative schema** workflow using [pg-delta](https://github.com/supabase/pg-toolbelt/tree/main/packages/pg-delta) to export the database shape into version-controlled `.sql` files and generate migrations by diffing desired state against the running Supabase DB. For full details, prerequisites, and commands, see [docs/declarative-schema.md](docs/declarative-schema.md).

### Website (database.dev)

The website/ directory contains a Next.js project, which serves as the visual interface for users to interact with the registry.

Requires:
- [node 14+](https://nodejs.org/en)

Copy `.env.example` file to `.env.local`:

```
cp .env.example .env.local
```

Edit the `.env.local` file with your favourite text editor to set the environment variables `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`:

```
NEXT_PUBLIC_SUPABASE_URL="<Value of API URL>"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<Value of anon key>"
```

Start the development environment:

```
cd website
npm install
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000)


### Architecture

- The core tables are located in the `app` schema.
- The public API is located in the `public` schema.

![ERD](assets/erd.png)
