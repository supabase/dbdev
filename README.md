# dbdev

A work-in-progress package index for SQL databases.


## Developers

### Start Local Environment
```
supabase start
```

### Architecture

- The core tables are located in the `app` schema.
- The public API is located in the `public` schema.
- There entity creation delegated to version functions (see Usage below)

![ERD](assets/erd.png)

### Usage: Version 0.0.1

See [supabase/seed.sql](supabase/seed.sql) for usage
