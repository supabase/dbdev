-- The original semver domain defined in 20220117141507_semver.sql doesn't allow null
-- app.semver_struct values, but we need a nullable app.semver column for the new
-- default_version_struct column in the app.packages table (see alter table app.package below).
-- So we modify the `is_valid` function such that it returns true if the input version itself is
-- null. All the existing tables where app.semver domain is used already have an additional
-- non null constraint, so their behaviour doesn't change.
create or replace function app.is_valid(version app.semver_struct)
    returns boolean
    immutable
    language sql
as $$
    select (
        version is null or (
            version.major is not null
            and version.minor is not null
            and version.patch is not null
        )
    )
$$;

-- same definition as the original function defined in 20220117141507_semver.sql with the only
-- difference being that this is marked strict. This is done so that the function returns null
-- on null input instead of `..`
create or replace function app.semver_to_text(version app.semver)
    returns text
    immutable
    strict
    language sql
as $$
    select
        format('%s.%s.%s', version.major, version.minor, version.patch)
$$;

-- default version columns are nullable for backward compatibility with older clients
alter table app.packages
add column default_version_struct app.semver,
add column default_version text generated always as (app.semver_to_text(default_version_struct)) stored;

-- for now we set the default version to current latest version
-- new client will allow users to set a specific default version in the control file
update app.packages
set default_version_struct = app.text_to_semver(pp.latest_version)
from public.packages pp
where packages.id = pp.id;

-- add new default_version column to the view
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
        pa.default_version
    from
        app.packages pa,
        lateral (
            select *
            from app.package_versions pv
            where pv.package_id = pa.id
            order by pv.version_struct
            limit 1
        ) newest_ver;

-- publish_package accepts an additional `default_version` argument
create or replace function public.publish_package(
    package_name app.valid_name,
    package_description varchar(1000),
    relocatable bool default false,
    requires text[] default '{}',
    default_version text default null
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

    insert into app.packages(handle, partial_name, control_description, control_relocatable, control_requires, default_version_struct)
    values (account.handle, package_name, package_description, relocatable, requires, app.text_to_semver(default_version))
    on conflict on constraint packages_handle_partial_name_key
    do update
    set control_description = excluded.control_description,
        control_relocatable = excluded.control_relocatable,
        control_requires = excluded.control_requires,
        default_version_struct = excluded.default_version_struct;
end;
$$;
