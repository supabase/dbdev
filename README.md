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

### Account Creation
```sql
-- Create dummy gotrue account
insert into auth.users(id, email)
values (uuid_generate_v4(), 'baz@supabase.io');

begin;
    -- Login as an authenticated user
    select app.simulate_login('bar@supabase.io');

    -- Create an Account
    select public.v0_create_account(
        handle := 'bar',
        display_name := 'Bar Barswel',
        contact_email := 'bar@supabase.io'
    );
end;
```

### Organization Creation
```sql
begin;
    select app.simulate_login('bar@supabase.io');

    -- Create an Organization
    select public.v0_create_organization(
        handle := 'supabase',
        display_name := 'Supabase',
        bio := null::text,
        contact_email := 'support@supabase.io',
        avatar_id := null::uuid
    );
end;
```

### Package Publishing
```sql
-- Dummy object, uploaded to storage API
insert into storage.objects(bucket_id, name)
values ('package_version', 'supabase/math__0.3.1.sql');

begin
    select app.simulate_login('bar@supabase.io');
    
    -- Publish a package
    select public.v0_publish_package_version(
        body := $${
            "name": "supabase/math",
            "version": "0.3.1"
        }$$,
        object_id := obj.id
    )
    from
        storage.objects obj
    where
        bucket_id = 'package_version'
        and name = 'supabase/math__0.3.1.sql';
end;
```

### Organization Add/Remove Membmer
TODO
