--create view v0.accounts as
create view public.accounts as
    select
        id,
        username,
        avatar_id,
        display_name,
        bio,
        contact_email,
        created_at
    from
        app.accounts;


--create view v0.organizations as
create view public.organizations as
    select
        org.id,
        org.username,
        org.avatar_id,
        org.display_name,
        org.bio,
        org.contact_email,
        org.created_at
    from
        app.organizations org;


--create view v0.members as
create view public.members as
    select
        aio.organization_id,
        aio.account_id,
        aio.role,
        aio.created_at
    from
        app.members aio;



--create view v0.packages as
create view public.packages as
    select
        pa.id,
        pa.slug,
        pa.username,
        pa.name,
        pa.created_at
    from
        app.packages pa
    group by
        pa.id,
        pa.username,
        pa.name,
        pa.created_at;


--create view v0.package_versions as
create view public.package_versions as
    select
        pv.id,
        pa.slug,
        app.semver_to_text(pv.semver) version,
        pv.package_id,
        pv.object_id,
        obj.name as object_key,
        pv.upload_metadata,
        pv.created_at
    from
        app.packages pa
        join app.package_versions pv
            on pa.id = pv.package_id
        join storage.objects obj
            on pv.object_id = obj.id;
