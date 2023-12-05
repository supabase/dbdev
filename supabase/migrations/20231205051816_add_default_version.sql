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
