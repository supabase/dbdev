create view public.accounts as
    select
        acc.id,
        acc.handle,
        acc.avatar_id,
        acc.display_name,
        acc.bio,
        acc.contact_email,
        acc.created_at
    from
        app.accounts acc;


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
        pa.name,
        pa.handle,
        pa.partial_name,
        pa.created_at
    from
        app.packages pa;


create view public.package_versions as
    select
        pv.id,
        pv.package_id,
        pa.name as package_name,
        pv.control_comment,
        app.semver_to_text(pv.semver) version,
        pv.created_at
    from
        app.packages pa
        join app.package_versions pv
            on pa.id = pv.package_id
