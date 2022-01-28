-- Usual signup flow to create users
insert into auth.users(id, email, raw_user_meta_data)
values
    (uuid_generate_v4(), 'foo@supabase.io', '{"handle": "foo"}'),
    (uuid_generate_v4(), 'bar@supabase.io', '{"handle": "bar"}');


-- Dummy object upload
insert into storage.objects(id, bucket_id, name, owner)
select
    '4714362f-c55a-4a15-9afb-c8cf43ceb145'::uuid,
    'package_versions',
    'supabase/stats/0.3.1.sql',
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
    select app.simulate_login('foo@supabase.io');

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
            "name": "supabase/stats",
            "version": "0.3.1"
        }$$,
        object_name := 'supabase/stats/0.3.1.sql'
    );

    -- TODO add member to org
end;


select pg_stat_statements_reset();
