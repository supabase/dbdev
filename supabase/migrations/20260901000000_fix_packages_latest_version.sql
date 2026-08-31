-- Fix issue #138: Add repository_url to app.packages
alter table app.packages
add column if not exists repository_url text null;

-- Grant permissions for authenticated users on repository_url column
grant insert (partial_name, handle, control_description, control_relocatable, control_requires, default_version_struct, repository_url)
    on app.packages
    to authenticated;

grant update (control_description, control_relocatable, control_requires, default_version_struct, repository_url)
    on app.packages
    to authenticated;

-- Update publish_package to accept repository parameter
create or replace function public.publish_package(
    package_name app.valid_name,
    package_description varchar(1000),
    relocatable bool default false,
    requires text[] default '{}',
    default_version text default null,
    repository text default null
)
    returns void
    language plpgsql
as $$
declare
    account app.accounts = account from app.accounts account where id = auth.uid();
    require text;
begin
    if account.handle is null then
        raise exception 'user not logged in';
    end if;

    if default_version is null then
        raise exception 'default_version is required.';
    end if;

    foreach require in array requires
    loop
        if not exists (
            select true
            from app.allowed_extensions
            where
                name = require
        ) then
            raise exception '`requires` in the control file can''t have `%` in it', require;
        end if;
    end loop;

    insert into app.packages(handle, partial_name, control_description, control_relocatable, control_requires, default_version_struct, repository_url)
    values (account.handle, package_name, package_description, relocatable, requires, app.text_to_semver(default_version), repository)
    on conflict on constraint packages_handle_partial_name_key
    do update
    set control_description = excluded.control_description,
        control_relocatable = excluded.control_relocatable,
        control_requires = excluded.control_requires,
        default_version_struct = excluded.default_version_struct,
        repository_url = coalesce(excluded.repository_url, app.packages.repository_url);
end;
$$;

-- Fix issue #161 & #138: public.packages view should consider app.package_upgrades for latest_version and expose repository_url
create or replace view public.packages as
    select
        pa.id,
        pa.package_name,
        pa.handle,
        pa.partial_name,
        coalesce(newest_ver.version, pa.default_version) as latest_version,
        newest_desc.description_md,
        pa.control_description,
        pa.control_requires,
        pa.created_at,
        pa.default_version,
        pa.package_alias,
        pa.repository_url
    from
        app.packages pa
        left join lateral (
            select version, version_struct
            from (
                select pv.version, pv.version_struct
                from app.package_versions pv
                where pv.package_id = pa.id
                union
                select pu.to_version as version, pu.to_version_struct as version_struct
                from app.package_upgrades pu
                where pu.package_id = pa.id
            ) all_versions
            order by version_struct desc
            limit 1
        ) newest_ver on true
        left join lateral (
            select description_md
            from app.package_versions pv
            where pv.package_id = pa.id and pv.description_md is not null
            order by pv.version_struct desc
            limit 1
        ) newest_desc on true;

alter view public.packages set (security_invoker = true);
