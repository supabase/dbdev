create view public.accounts as
    select
        acc.id,
        acc.handle,
        obj.name as avatar_path,
        acc.display_name,
        acc.bio,
        acc.contact_email,
        acc.created_at
    from
        app.accounts acc
        left join storage.objects obj
            on acc.avatar_id = obj.id;


create view public.organizations as
    select
        org.id,
        org.handle,
        obj.name as avatar_path,
        org.display_name,
        org.bio,
        org.contact_email,
        org.created_at
    from
        app.organizations org
        left join storage.objects obj
            on org.avatar_id = obj.id;


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
