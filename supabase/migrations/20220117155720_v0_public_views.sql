create view public.v0_account as
    select
        id,
        handle,
        auth_user_id,
        avatar_id,
        display_name,
        bio,
        contact_email,
        created_at
    from
        app.account;


create view public.v0_organization as
    select
        org.id,
        org.handle,
        org.avatar_id,
        org.display_name,
        org.bio,
        org.contact_email,
        org.created_at
    from
        app.organization org;

create view public.v0_organization_member as
    select
        aio.id,
        aio.organization_id,
        aio.account_id,
        aio.member_role,
        aio.created_at
    from
        app.account_in_organization aio;


create view public.v0_package as
    select
        pa.id,
        format('%s/%s', pa.handle, pa.partial_name) as package_name,
        pa.handle,
        pa.partial_name,
        pa.created_at
    from
        app.package pa
    group by
        pa.id,
        pa.handle,
        pa.partial_name,
        pa.created_at;


create or replace view public.v0_package_version as
    select
        pv.id,
        format('%s/%s', pa.handle, pa.partial_name) as package_name,
        app.semver_to_text(pv.semver) version,
        pv.package_id,
        pv.object_id,
        pv.upload_metadata,
        pv.created_at
    from
        app.package pa
        join app.package_version pv
            on pa.id = pv.package_id;
