insert into auth.users(id, email)
values (uuid_generate_v4(), 'test@example.com');

insert into app.handle_registry(is_organization, handle)
values (false, 'some_user'), (true, 'supabase');

insert into app.account(handle, auth_user_id)
select
    'some_user',
    au.id
from
    auth.users au
where
    au.email='test@example.com';

insert into app.package(partial_name, handle)
values ('math',    'some_user');


insert into storage.objects(bucket_id, name)
values ('package_version', 'math__0.3.1.sql');


insert into app.package_version(package_id, semver, object_id, upload_metadata)
select
    ap.id,
    app.text_to_semver('0.3.1'),
    so.id,
    '{}'
from
    app.package ap,
    storage.objects so
where
    ap.partial_name = 'math'
    and so.name = 'math__0.3.1.sql';

insert into app.organization(handle)
values ('supabase');


insert into app.account_in_organization(organization_id, account_id, member_role)
select
    org.id,
    acc.id,
    'owner'
from
    app.organization org,
    app.account acc
where
    org.handle = 'supabase'
    and acc.handle = 'some_user'
