create table app.packages(
    id uuid primary key default uuid_generate_v4(),
    -- TODO set to app.valid_name
    partial_name citext not null, -- ex: math
    handle citext not null references app.handle_registry(handle),
    created_at timestamp not null default (now() at time zone 'utc'),
    -- website?
    -- description in markdown?
    unique (handle, partial_name)
);

insert into storage.buckets (id, name)
values
    ('package_versions', 'package_versions');

create table app.package_versions(
    id uuid primary key default uuid_generate_v4(),
    package_id uuid not null references app.packages(id),
    semver app.semver not null,
    object_id uuid not null unique references storage.objects(id),
    upload_metadata jsonb, -- contents of package.json from payload
     /*
    yanked versions are ignored during dependency resolution
    unless the yanked version is the only version satisfying the version requirements
    */
    yanked_at timestamp,
    created_at timestamp not null default (now() at time zone 'utc'),
    unique(package_id, semver)
);
create index package_versions_semver_text on app.package_versions (app.semver_to_text(semver));

create type app.version_operator as enum ('lt', 'lte', 'eq', 'gte', 'gt');

create table app.package_version_dependencies(
    id uuid primary key default uuid_generate_v4(),
    package_version_id uuid not null references app.package_versions(id),
    depends_on_package_id uuid not null references app.packages(id),
    depends_on_operator app.version_operator not null,
    depends_on_version app.semver not null,
    created_at timestamp not null default (now() at time zone 'utc'),
    unique(package_version_id, depends_on_package_id, depends_on_operator)
);


create function app.to_package_name(handle app.valid_name, partial_name app.valid_name)
    returns text
    immutable
    language sql
as $$
    select format('%s/%s', $1, $2)
$$;

create function app.version_text_to_handle(version text)
    returns app.valid_name
    immutable
    language sql
as $$
    select split_part($1, '/', 1)
$$;

create function app.version_text_to_package_partial_name(version text)
    returns app.valid_name
    immutable
    language sql
as $$
    select split_part($1, '/', 2)
$$;


-- TODO: disable deletes or updates in storage.objects for package_version bucket
