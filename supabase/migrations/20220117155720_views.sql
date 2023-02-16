create view public.accounts as
    select
        id,
        handle,
        avatar_id,
        display_name,
        bio,
        contact_email,
        created_at
    from
        app.accounts;


create view public.organizations as
    select
        org.id,
        org.handle,
        org.avatar_id,
        org.display_name,
        org.bio,
        org.contact_email,
        org.created_at
    from
        app.organizations org;


create view public.members as
    select
        aio.organization_id,
        aio.account_id,
        aio.role,
        aio.created_at
    from
        app.members aio;


create view public.packages as
    select
        pa.id,
        app.to_package_name(pa.handle, pa.partial_name) as package_name,
        pa.handle,
        pa.partial_name,
        pa.created_at
    from
        app.packages pa
    group by
        pa.id,
        pa.handle,
        pa.partial_name,
        pa.created_at;


create view public.package_versions as
    select
        pv.id,
        app.to_package_name(pa.handle, pa.partial_name) as package_name,
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
