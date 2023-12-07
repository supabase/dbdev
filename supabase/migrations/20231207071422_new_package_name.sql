create function app.to_new_package_name(handle app.valid_name, partial_name app.valid_name)
    returns text
    immutable
    language sql
as $$
    select format('%s@%s', $1, $2)
$$;

alter table app.packages
add column new_package_name text not null generated always as (app.to_new_package_name(handle, partial_name)) stored;

-- add new_package_name column to the views
create or replace view public.packages as
    select
        pa.id,
        pa.package_name,
        pa.handle,
        pa.partial_name,
        newest_ver.version as latest_version,
        newest_ver.description_md,
        pa.control_description,
        pa.control_requires,
        pa.created_at,
        pa.default_version,
        pa.new_package_name
    from
        app.packages pa,
        lateral (
            select *
            from app.package_versions pv
            where pv.package_id = pa.id
            order by pv.version_struct desc
            limit 1
        ) newest_ver;

create or replace view public.package_versions as
    select
        pv.id,
        pv.package_id,
        pa.package_name,
        pv.version,
        pv.sql,
        pv.description_md,
        pa.control_description,
        pa.control_requires,
        pv.created_at,
        pa.new_package_name
    from
        app.packages pa
        join app.package_versions pv
            on pa.id = pv.package_id;

create or replace view public.package_upgrades
    as
    select
        pu.id,
        pu.package_id,
        pa.package_name,
        pu.from_version,
        pu.to_version,
        pu.sql,
        pu.created_at,
        pa.new_package_name
    from
        app.packages pa
        join app.package_upgrades pu
            on pa.id = pu.package_id;

create or replace function public.register_download(package_name text)
    returns void
    language sql
    security definer
    as
$$
    insert into app.downloads(package_id)
    select id
    from app.packages ap
    where ap.package_name = $1 or ap.new_package_name = $1
$$;
