create view public.accounts
    as
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

create view public.organizations
    as
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

create view public.members
    as
    select
        aio.organization_id,
        aio.account_id,
        aio.role,
        aio.created_at
    from
        app.members aio;

create view public.packages
    as
    select
        pa.id,
        pa.package_name,
        pa.handle,
        pa.partial_name,
        pa.created_at
    from
        app.packages pa;

create view public.package_versions
    as
    select
        pv.id,
        pv.package_id,
        pa.package_name,
        pv.version,
        pv.sql,
        pv.created_at
    from
        app.packages pa
        join app.package_versions pv
            on pa.id = pv.package_id;

create view public.package_upgrades
    as
    select
        pu.id,
        pu.package_id,
        pa.package_name,
        pu.from_version,
        pu.to_version,
        pu.sql,
        pu.created_at
    from
        app.packages pa
        join app.package_upgrades pu
            on pa.id = pu.package_id;
