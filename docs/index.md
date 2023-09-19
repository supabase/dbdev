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

dbdev is a package manager for Postgres [trusted lanuguage extensions](https://github.com/aws/pg_tle) (TLEs). It consists of:

- [database.dev](https://database.dev): our first-party package registry to store and distribute TLEs
- dbdev CLI: a CLI for publishing TLEs to a registries
- dbdev client: an in-database client for installing TLEs from registries

If you want to publish your own TLE, you will need the dbdev CLI. Follow its [installation instructions](/dbdev/cli#installation) to get started.

If you want to install an extension from the registry, you will need the SQL dbdev client. Follow the [installation instructions](https://database.dev/installer) to enable it in your database.
