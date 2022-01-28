# dbdev/math

dbdev/math is a sample library intended for testing the `dbdev` CLI.


We will walk through:

- creating a user account
- publishing a package
- retreiving the pacakge

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

### Create a User Account

We can create a new user account with the `dbdev sign-up` command. If `DBDEV_EMAIL` and `DBDEV_PASSWORD` are set in `.env` they will be used as your email address and password. If not, you will be prompted.

Then we must choose a `handle`. Since handles are prefixed to pacakge names, you must use the handle `"example"` or update `database.json`'s `name` field with your choice.

```
$ dbdev sign-up

Handle (ex: j_smith):   example
Successfully created account example (example@domain.com)
```


### Publish the package

Now that we have a user account that owns the handle `example` we can publish the package. If credentials are not provided in `.env` you will be prompted for an email address and password.

```
$ dbdev publish
Successfully published pacakge example/math
```

### Retrieve the Package's Source Code from the Package Index

```
$ dbdev get example/math --version=0.0.1

/*
    package: example/math
    version: 0.0.1
*/
create schema math if not exsits;

create function math.add(int, int)
    returns int
    immutable
    strict
    language sql
as $$
    select $1 + $2
$$;
```

If `version` is not provided, the highest version is used.