create function app.to_slug(username app.valid_name, name app.valid_name)
    returns text
    immutable
    language sql
as $$
    select format('%s/%s', $1, $2)
$$;

create table app.packages(
    id uuid primary key default uuid_generate_v4(),
    name app.valid_name not null, -- ex: math
    username app.valid_name not null references app.username_registry(username),
    slug text not null generated always as (app.to_slug(username, name)) stored,
    created_at timestamp not null default (now() at time zone 'utc'),
    -- website?
    -- description in markdown?
    unique (username, name)
);

insert into storage.buckets (id, name)
values ('package_versions', 'package_versions');

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

create function app.slug_to_username(version text)
    returns app.valid_name
    immutable
    language sql
as $$
    select split_part($1, '/', 1)
$$;

create function app.slug_to_package_name(version text)
    returns app.valid_name
    immutable
    language sql
as $$
    select split_part($1, '/', 2)
$$;


-- TODO: disable deletes or updates in storage.objects for package_version bucket
