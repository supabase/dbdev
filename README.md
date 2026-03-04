![dbdev](/assets/dbdev-banner.jpg)

# dbdev

dbdev is a package manager for Postgres [trusted language extensions (TLE)](https://github.com/aws/pg_tle).

## Links

- Search for packages on [database.dev](https://database.dev)
- Documentation: [database.dev/docs](https://database.dev/docs)
- Publish your own Extension: [database.dev/docs/publish-extension](https://database.dev/docs/publish-extension)
- Read the dbdev [release blog post](https://supabase.com/blog/dbdev)

## What is a Trusted Language Extension?

Trusted Language Extensions (TLE) allow PostgreSQL extensions to be installed by non-superusers by restricting them to trusted languages such as SQL and PL/pgSQL. Because these languages cannot access the operating system or unsafe memory, the extensions can run safely in managed environments where superuser access is not available. TLEs are commonly used in hosted PostgreSQL services to enable a safer extension ecosystem without granting elevated privileges.

## Licence

Apache 2.0
