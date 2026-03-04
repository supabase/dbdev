create table app.package_upgrades (
    id                  uuid                      default gen_random_uuid() not null,
    package_id          uuid                      not null,
    from_version_struct app.semver                not null,
    from_version        text                      generated always as (app.semver_to_text(from_version_struct)) stored not null,
    to_version_struct   app.semver                not null,
    to_version          text                      generated always as (app.semver_to_text(to_version_struct)) stored not null,
    sql                 character varying(250000),
    created_at          timestamp with time zone  default now() not null
);

create policy package_upgrades_select_policy on app.package_upgrades
    for select
    using (true);

alter table app.package_upgrades
    enable row level security;

alter table app.package_upgrades
    add constraint package_upgrades_package_id_from_version_struct_to_version__key unique (package_id, from_version_struct, to_version_struct);

alter table app.package_upgrades
    add constraint package_upgrades_pkey primary key (id);

alter table app.package_upgrades
    add constraint package_upgrades_package_id_fkey foreign key (package_id) references app.packages(id);

grant insert (from_version_struct, package_id, sql, to_version_struct) on app.package_upgrades to authenticated;