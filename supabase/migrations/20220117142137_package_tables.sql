create function app.to_package_name(handle app.valid_name, partial_name app.valid_name)
    returns text
    immutable
    language sql
as $$
    select format('%s-%s', $1, $2)
$$;

create table app.packages(
    id uuid primary key default gen_random_uuid(),
    partial_name app.valid_name not null,
    handle app.valid_name not null references app.handle_registry(handle),
    name text not null generated always as (app.to_package_name(handle, partial_name)) stored,
    created_at timestamptz not null default (now()),
    description_object_id uuid not null unique references storage.objects(id),
    unique (handle, partial_name),
    unique (name)
);

insert into storage.buckets (id, name)
values ('package_versions', 'package_versions');

create table app.package_versions(
    id uuid primary key default gen_random_uuid(),
    package_id uuid not null references app.packages(id),
    semver app.semver not null,
    source_object_id uuid not null unique references storage.objects(id),
    description_object_id uuid not null unique references storage.objects(id),
    control_comment varchar(500),
    control_encoding varchar(128),
    control_requires varchar(128)[],
    control_relocatable bool not null default false,
    created_at timestamptz not null default (now()),
    unique(package_id, semver)
);

create index package_versions_semver_text on app.package_versions (app.semver_to_text(semver));

create function app.version_text_to_handle(version text)
    returns app.valid_name
    immutable
    language sql
as $$
    select split_part($1, '-', 1)
$$;

create function app.version_text_to_package_partial_name(version text)
    returns app.valid_name
    immutable
    language sql
as $$
    select split_part($1, '-', 2)
$$;
