create table app.package(
    id uuid primary key default uuid_generate_v4(),
    partial_name app.valid_name not null, -- ex: math
    handle app.valid_name not null references app.handle_registry(handle),
    created_at timestamp not null default (now() at time zone 'utc'),
    -- website?
    -- description in markdown?
    unique (handle, partial_name)
);

insert into storage.buckets (id, name)
values ('package_version', 'package_version');

create table app.package_version(
    id uuid primary key default uuid_generate_v4(),
    package_id uuid not null references app.package(id),
    semver app.semver not null,
    object_id uuid not null references storage.objects(id),
    upload_metadata jsonb, -- contents of package.json from payload
    created_at timestamp not null default (now() at time zone 'utc'),
    unique(package_id, semver)
);
create index package_version_semver_text on app.package_version (app.semver_to_text(semver));

create type app.version_operator as enum ('lt', 'lte', 'eq', 'gte', 'gt');

create table app.package_version_dependency(
    id uuid primary key default uuid_generate_v4(),
    package_version_id uuid not null references app.package_version(id),
    depends_on_package_id uuid not null references app.package(id),
    depends_on_operator app.version_operator not null,
    depends_on_version app.semver not null,
    created_at timestamp not null default (now() at time zone 'utc'),
    unique(package_version_id, depends_on_package_id, depends_on_operator)
);
