# dbdev/math

dbdev/math is a sample library intended for testing the `dbdev` CLI.

We will walk through:

- creating a user account
- publishing a package
- retrieving the package

### Setup

First, start the project locally

```
$ supabase start

Started local development setup.

         API URL: http://localhost:54321
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.ZopqoUt20nEV9cklpv9e3yw3PVyZLmKs5qLD6nGL1SI
service_role key: ...
```

next, copy the `anon key` into the local `.env` file under the `DBDEV_ANON_KEY` key.

Now we're ready to use the `dbdev` CLI.

### Environment

Create a `.env` file in the repo root with the following contents

```
# .env
DBDEV_EMAIL=example@domain.com
DBDEV_PASSWORD=asdfasdf

DBDEV_URL=http://localhost:54321
DBDEV_ANON_KEY=<anon key from previous step>
```

<WORK-IN-PROGRESS>
