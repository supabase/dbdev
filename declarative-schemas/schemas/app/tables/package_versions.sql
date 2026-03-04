create table app.package_versions (
    id             uuid                      default gen_random_uuid() not null,
    package_id     uuid                      not null,
    version_struct app.semver                not null,
    version        text                      generated always as (app.semver_to_text(version_struct)) stored not null,
    sql            character varying(250000),
    description_md character varying(250000),
    created_at     timestamp with time zone  default now() not null
);

create policy package_versions_select_policy on app.package_versions
    for select
    using (true);

alter table app.package_versions
    enable row level security;

alter table app.package_versions
    add constraint package_versions_package_id_version_struct_key unique (package_id, version_struct);

alter table app.package_versions
    add constraint package_versions_pkey primary key (id);

alter table app.package_versions
    add constraint package_versions_package_id_fkey foreign key (package_id) references app.packages(id);

grant insert (description_md, package_id, sql, version_struct) on app.package_versions to authenticated;