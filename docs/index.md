# `dbdev`

<p>
<a href=""><img src="https://img.shields.io/badge/postgresql-14+-blue.svg" alt="PostgreSQL version" height="18"></a>
<a href="https://github.com/supabase/dbdev/blob/master/LICENSE"><img src="https://img.shields.io/pypi/l/markdown-subtemplate.svg" alt="License" height="18"></a>
<a href="https://github.com/supabase/dbdev/actions/workflows/pgTAP.yaml"><img src="https://github.com/supabase/dbdev/actions/workflows/pgTAP.yaml/badge.svg" alt="pgTAP Tests" height="18"></a>
<a href="https://github.com/supabase/dbdev/actions/workflows/cli.yaml"><img src="https://github.com/supabase/dbdev/actions/workflows/cli.yaml/badge.svg" alt="CLI" height="18"></a>

</p>

---

**Documentation**: <a href="https://supabase.github.io/dbdev" target="_blank">https://supabase.github.io/dbdev</a>

**Source Code**: <a href="https://github.com/supabase/dbdev" target="_blank">https://github.com/supabase/dbdev</a>

---

## Overview

dbdev is a package manager for Postgres [trusted language extensions](https://github.com/aws/pg_tle) (TLEs). It consists of:

- [database.dev](https://database.dev): our first-party package registry to store and distribute TLEs.
- dbdev CLI: a CLI for publishing TLEs to a registry. This CLI will continue to be available in the short term, but we plan to merge it into the Supabase CLI in the future.
- dbdev client (deprecated): an in-database client for installing TLEs from registries. The in-database client is deprecated and will be removed in the future. We recommend using the dbdev CLI's `dbdev add` command to generate the SQL needed to install a TLE, and then including that SQL in your database as a migration file.

If you want to publish your own TLE or install and extension from the registry, you will need the dbdev CLI. Follow its [installation instructions](cli.md#installation) to get started.

!!! warning

    Restoring a logical backup of a database with a TLE installed can fail. For this reason, dbdev should only be used with databases with physical backups enabled.
