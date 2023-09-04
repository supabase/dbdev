-- Enable pgTAP if it's not already enabled
create extension if not exists pgtap with schema extensions;

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

-- we have to run some tests to get this to pass as the first test file.
-- investigating options to make this better.  Maybe a dedicated test harness
-- but we dont' want these functions to always exist on the database.
BEGIN;

    select plan(7);
    select function_returns('tests', 'create_supabase_user', Array['text', 'text', 'text', 'jsonb'], 'uuid');
    select function_returns('tests', 'get_supabase_uid', Array['text'], 'uuid');
    select function_returns('tests', 'get_supabase_user', Array['text'], 'json');
    select function_returns('tests', 'authenticate_as', Array['text'], 'void');
    select function_returns('tests', 'clear_authentication', Array[null], 'void');
    select function_returns('tests', 'rls_enabled', Array['text', 'text'], 'text');
    select function_returns('tests', 'rls_enabled', Array['text'], 'text');
    select * from finish();
ROLLBACK;
