-- Usual signup flow to create users
insert into auth.users(id, email)
values
    (uuid_generate_v4(), 'foo@supabase.io'),
    (uuid_generate_v4(), 'bar@supabase.io');


-- Dummy object upload
insert into storage.objects(id, bucket_id, name, owner)
select
    '4714362f-c55a-4a15-9afb-c8cf43ceb145'::uuid,
    'package_versions',
    'supabase/math__0.3.1.sql',
    id
from
    auth.users
where
    email = 'foo@supabase.io';


/*
    PUBLIC API
*/
begin;
    -- Login as foo@supabase.io
    select app.simulate_login('bar@supabase.io');
    -- Create an Account
    select public.create_account(
        handle := 'bar',
        display_name := 'Bar Barswel',
        contact_email := 'bar@supabase.io'
    );
end;

begin;
    -- Login as foo@supabase.io
    select app.simulate_login('foo@supabase.io');

    -- Create an Account
    select public.create_account(
        handle := 'foo',
        display_name := 'Foo Fooington',
        contact_email := 'foo@supabase.io'
    );

    -- Create an Organization
    select public.create_organization(
        handle := 'supabase',
        display_name := 'Supabase',
        bio := null::text,
        contact_email := 'support@supabase.io',
        avatar_id := null::uuid
    );

    -- Publish a package
    select public.publish_package_version(
        body := $${
            "name": "supabase/math",
            "version": "0.3.1"
        }$$,
        object_id := '4714362f-c55a-4a15-9afb-c8cf43ceb145'
    );

    -- TODO add member to org
end;
