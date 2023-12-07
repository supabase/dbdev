create function app.to_new_package_name(handle app.valid_name, partial_name app.valid_name)
    returns text
    immutable
    language sql
as $$
    select format('%s@%s', $1, $2)
$$;

alter table app.packages
add column new_package_name text not null generated always as (app.to_new_package_name(handle, partial_name)) stored;

-- add new_package_name column to the view
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
