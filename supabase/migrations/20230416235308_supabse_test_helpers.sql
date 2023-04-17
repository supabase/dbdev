
insert into app.packages(
    handle,
    partial_name,
    control_description,
    control_relocatable,
    control_requires
)
values (
    'basejump',
    'supabase_test_helpers',
    'pgTAP functions for testing Supabase Apps including auth and RLS',
    false,
    '{pgtap}'
);


insert into app.package_versions(package_id, version_struct, sql, description_md)
values (
(select id from app.packages where package_name = 'basejump-supabase_test_helpers'),
(0,0,1),
$pkg$
-- We want to store all of this in the tests schema to keep it
-- separate from any application data
CREATE SCHEMA IF NOT EXISTS tests;

-- anon and authenticated should have access to tests schema
GRANT USAGE ON SCHEMA tests TO anon, authenticated;
-- Don't allow public to execute any functions in the tests schema
ALTER DEFAULT PRIVILEGES IN SCHEMA tests REVOKE EXECUTE ON FUNCTIONS FROM public;
-- Grant execute to anon and authenticated for testing purposes
ALTER DEFAULT PRIVILEGES IN SCHEMA tests GRANT EXECUTE ON FUNCTIONS TO anon, authenticated;

/**
    * ### tests.create_supabase_user(identifier text, email text, phone text)
    *
    * Creates a new user in the `auth.users` table.
    * You can recall a user's info by using `tests.get_supabase_user(identifier text)`.
    *
    * Parameters:
    * - `identifier` - A unique identifier for the user. We recommend you keep it memorable like "test_owner" or "test_member"
    * - `email` - (Optional) The email address of the user
    * - `phone` - (Optional) The phone number of the user
    * - `metadata` - (Optional) Additional metadata to be added to the user
    *
    * Returns:
    * - `user_id` - The UUID of the user in the `auth.users` table
    *
    * Example:
    * ```sql
    *   SELECT tests.create_supabase_user('test_owner');
    *   SELECT tests.create_supabase_user('test_member', 'member@test.com', '555-555-5555');
    *   SELECT tests.create_supabase_user('test_member', 'member@test.com', '555-555-5555', '{"key": "value"}'::jsonb);
    * ```
 */
CREATE OR REPLACE FUNCTION tests.create_supabase_user(identifier text, email text default null, phone text default null, metadata jsonb default null)
RETURNS uuid
    SECURITY DEFINER
    SET search_path = auth, pg_temp
AS $$
DECLARE
    user_id uuid;
BEGIN

    -- create the user
    user_id := extensions.uuid_generate_v4();
    INSERT INTO auth.users (id, email, phone, raw_user_meta_data)
    VALUES (user_id, coalesce(email, concat(user_id, '@test.com')), phone, jsonb_build_object('test_identifier', identifier) || coalesce(metadata, '{}'::jsonb))
    RETURNING id INTO user_id;

    RETURN user_id;
END;
$$ LANGUAGE plpgsql;

/**
    * ### tests.get_supabase_user(identifier text)
    *
    * Returns the user info for a user created with `tests.create_supabase_user`.
    *
    * Parameters:
    * - `identifier` - The unique identifier for the user
    *
    * Returns:
    * - `user_id` - The UUID of the user in the `auth.users` table
    *
    * Example:
    * ```sql
    *   SELECT posts where posts.user_id = tests.get_supabase_user('test_owner') -> 'id';
    * ```
 */
CREATE OR REPLACE FUNCTION tests.get_supabase_user(identifier text)
RETURNS json
SECURITY DEFINER
SET search_path = auth, pg_temp
AS $$
    DECLARE
        supabase_user json;
    BEGIN
        SELECT json_build_object('id', id, 'email', email, 'phone', phone, 'raw_user_meta_data', raw_user_meta_data) into supabase_user FROM auth.users WHERE raw_user_meta_data ->> 'test_identifier' = identifier limit 1;
        if supabase_user is null OR supabase_user -> 'id' IS NULL then
            RAISE EXCEPTION 'User with identifier % not found', identifier;
        end if;
        RETURN supabase_user;
    END;
$$ LANGUAGE plpgsql;

/**
    * ### tests.get_supabase_uid(identifier text)
    *
    * Returns the user UUID for a user created with `tests.create_supabase_user`.
    *
    * Parameters:
    * - `identifier` - The unique identifier for the user
    *
    * Returns:
    * - `user_id` - The UUID of the user in the `auth.users` table
    *
    * Example:
    * ```sql
    *   SELECT posts where posts.user_id = tests.get_supabase_uid('test_owner') -> 'id';
    * ```
 */
CREATE OR REPLACE FUNCTION tests.get_supabase_uid(identifier text)
    RETURNS uuid
    SECURITY DEFINER
    SET search_path = auth, pg_temp
AS $$
DECLARE
    supabase_user uuid;
BEGIN
    SELECT id into supabase_user FROM auth.users WHERE raw_user_meta_data ->> 'test_identifier' = identifier limit 1;
    if supabase_user is null then
        RAISE EXCEPTION 'User with identifier % not found', identifier;
    end if;
    RETURN supabase_user;
END;
$$ LANGUAGE plpgsql;

/**
    * ### tests.authenticate_as(identifier text)
    *   Authenticates as a user created with `tests.create_supabase_user`.
    *
    * Parameters:
    * - `identifier` - The unique identifier for the user
    *
    * Returns:
    * - `void`
    *
    * Example:
    * ```sql
    *   SELECT tests.create_supabase_user('test_owner');
    *   SELECT tests.authenticate_as('test_owner');
    * ```
 */
CREATE OR REPLACE FUNCTION tests.authenticate_as (identifier text)
    RETURNS void
    AS $$
        DECLARE
                user_data json;
                original_auth_data text;
        BEGIN
            -- store the request.jwt.claims in a variable in case we need it
            original_auth_data := current_setting('request.jwt.claims', true);
            user_data := tests.get_supabase_user(identifier);

            if user_data is null OR user_data ->> 'id' IS NULL then
                RAISE EXCEPTION 'User with identifier % not found', identifier;
            end if;


            perform set_config('role', 'authenticated', true);
            perform set_config('request.jwt.claims', json_build_object('sub', user_data ->> 'id', 'email', user_data ->> 'email', 'phone', user_data ->> 'phone')::text, true);

        EXCEPTION
            -- revert back to original auth data
            WHEN OTHERS THEN
                set local role authenticated;
                set local "request.jwt.claims" to original_auth_data;
                RAISE;
        END
    $$ LANGUAGE plpgsql;

/**
    * ### tests.clear_authentication()
    *   Clears out the authentication and sets role to anon
    *
    * Returns:
    * - `void`
    *
    * Example:
    * ```sql
    *   SELECT tests.create_supabase_user('test_owner');
    *   SELECT tests.authenticate_as('test_owner');
    *   SELECT tests.clear_authentication();
    * ```
 */
CREATE OR REPLACE FUNCTION tests.clear_authentication()
    RETURNS void AS $$
BEGIN
    perform set_config('role', 'anon', true);
    perform set_config('request.jwt.claims', null, true);
END
$$ LANGUAGE plpgsql;

/**
* ### tests.rls_enabled(testing_schema text)
* pgTAP function to check if RLS is enabled on all tables in a provided schema
*
* Parameters:
* - schema_name text - The name of the schema to check
*
* Example:
* ```sql
*   BEGIN;
*       select plan(1);
*       select tests.rls_enabled('public');
*       SELECT * FROM finish();
*   ROLLBACK;
* ```
*/
CREATE OR REPLACE FUNCTION tests.rls_enabled (testing_schema text)
RETURNS text AS $$
    select is(
        (select
           	count(pc.relname)::integer
           from pg_class pc
           join pg_namespace pn on pn.oid = pc.relnamespace and pn.nspname = rls_enabled.testing_schema
           join pg_type pt on pt.oid = pc.reltype
           where relrowsecurity = FALSE)
        ,
        0,
        'All tables in the' || testing_schema || ' schema should have row level security enabled');
$$ LANGUAGE sql;

/**
* ### tests.rls_enabled(testing_schema text, testing_table text)
* pgTAP function to check if RLS is enabled on a specific table
*
* Parameters:
* - schema_name text - The name of the schema to check
* - testing_table text - The name of the table to check
*
* Example:
* ```sql
*    BEGIN;
*        select plan(1);
*        select tests.rls_enabled('public', 'accounts');
*        SELECT * FROM finish();
*    ROLLBACK;
* ```
*/
CREATE OR REPLACE FUNCTION tests.rls_enabled (testing_schema text, testing_table text)
RETURNS TEXT AS $$
    select is(
        (select
           	count(*)::integer
           from pg_class pc
           join pg_namespace pn on pn.oid = pc.relnamespace and pn.nspname = rls_enabled.testing_schema and pc.relname = rls_enabled.testing_table
           join pg_type pt on pt.oid = pc.reltype
           where relrowsecurity = TRUE),
        1,
        testing_table || 'table in the' || testing_schema || ' schema should have row level security enabled'
    );
$$ LANGUAGE sql;

$pkg$,

$description$
# Supabase Test Helpers
A collection of functions designed to make testing Supabase projects easier.

## Usage
We do not recommend that you activate this extension globally. Instead, activate it as part of your pgTAP tests. That will make sure these functions are not available to your users.

For example, a test could look like:

```sql

BEGIN;
    CREATE EXTENSION supabase_test_helpers;
    
    select plan(1);
    -- create a table, which will have RLS disabled by default
    CREATE TABLE public.tb1 (id int, data text);
    ALTER TABLE public.tb1 ENABLE ROW LEVEL SECURITY;

    -- test to make sure RLS check works
    select check_test(tests.rls_enabled('public', 'tb1'), true);

    SELECT * FROM finish();
ROLLBACK;

```

## Contributing
Yes, please! Anything you've found helpful for testing Supabase projects is welcome. To contribute, head to [the GitHub repo](https://github.com/usebasejump/supabase-test-helpers)

## Test Helpers
The following is auto-generated off of comments in the `supabase_test_helpers.sql` file. Any changes added to the README directly will be overwritten.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [tests.create_supabase_user(identifier text, email text, phone text)](#testscreate_supabase_useridentifier-text-email-text-phone-text)
- [tests.get_supabase_user(identifier text)](#testsget_supabase_useridentifier-text)
- [tests.get_supabase_uid(identifier text)](#testsget_supabase_uididentifier-text)
- [tests.authenticate_as(identifier text)](#testsauthenticate_asidentifier-text)
- [tests.clear_authentication()](#testsclear_authentication)
- [tests.rls_enabled(testing_schema text)](#testsrls_enabledtesting_schema-text)
- [tests.rls_enabled(testing_schema text, testing_table text)](#testsrls_enabledtesting_schema-text-testing_table-text)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

<!-- include: supabase_test_helpers.sql -->

### tests.create_supabase_user(identifier text, email text, phone text)

Creates a new user in the `auth.users` table.
You can recall a user's info by using `tests.get_supabase_user(identifier text)`.

Parameters:
- `identifier` - A unique identifier for the user. We recommend you keep it memorable like "test_owner" or "test_member"
- `email` - (Optional) The email address of the user
- `phone` - (Optional) The phone number of the user
- `metadata` - (Optional) Additional metadata to be added to the user

Returns:
- `user_id` - The UUID of the user in the `auth.users` table

Example:
```sql
  SELECT tests.create_supabase_user('test_owner');
  SELECT tests.create_supabase_user('test_member', 'member@test.com', '555-555-5555');
  SELECT tests.create_supabase_user('test_member', 'member@test.com', '555-555-5555', '{"key": "value"}'::jsonb);
```

### tests.get_supabase_user(identifier text)

Returns the user info for a user created with `tests.create_supabase_user`.

Parameters:
- `identifier` - The unique identifier for the user

Returns:
- `user_id` - The UUID of the user in the `auth.users` table

Example:
```sql
  SELECT posts where posts.user_id = tests.get_supabase_user('test_owner') -> 'id';
```

### tests.get_supabase_uid(identifier text)

Returns the user UUID for a user created with `tests.create_supabase_user`.

Parameters:
- `identifier` - The unique identifier for the user

Returns:
- `user_id` - The UUID of the user in the `auth.users` table

Example:
```sql
  SELECT posts where posts.user_id = tests.get_supabase_uid('test_owner') -> 'id';
```

### tests.authenticate_as(identifier text)
  Authenticates as a user created with `tests.create_supabase_user`.

Parameters:
- `identifier` - The unique identifier for the user

Returns:
- `void`

Example:
```sql
  SELECT tests.create_supabase_user('test_owner');
  SELECT tests.authenticate_as('test_owner');
```

### tests.clear_authentication()
  Clears out the authentication and sets role to anon

Returns:
- `void`

Example:
```sql
  SELECT tests.create_supabase_user('test_owner');
  SELECT tests.authenticate_as('test_owner');
  SELECT tests.clear_authentication();
```

### tests.rls_enabled(testing_schema text)
pgTAP function to check if RLS is enabled on all tables in a provided schema

Parameters:
- schema_name text - The name of the schema to check

Example:
```sql
  BEGIN;
      select plan(1);
      select tests.rls_enabled('public');
      SELECT * FROM finish();
  ROLLBACK;
```

### tests.rls_enabled(testing_schema text, testing_table text)
pgTAP function to check if RLS is enabled on a specific table

Parameters:
- schema_name text - The name of the schema to check
- testing_table text - The name of the table to check

Example:
```sql
   BEGIN;
       select plan(1);
       select tests.rls_enabled('public', 'accounts');
       SELECT * FROM finish();
   ROLLBACK;
```

<!-- /include: supabase_test_helpers.sql -->

$description$
);