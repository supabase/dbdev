create table app.packages (
    id                  uuid                     default gen_random_uuid() not null,
    package_name        text                     generated always as (app.to_package_name(handle, partial_name)) stored not null,
    handle              app.valid_name           not null,
    partial_name        app.valid_name           not null,
    control_description character varying(1000),
    control_relocatable boolean                  default false not null,
    control_requires    character varying(128)[] default '{}'::character varying(128)[],
    created_at          timestamp with time zone default now() not null
);

create index packages_handle_search_idx on app.packages using gin (handle extensions.gin_trgm_ops);

create index packages_partial_name_search_idx on app.packages using gin (partial_name extensions.gin_trgm_ops);

create policy packages_select_policy on app.packages
    for select
    to authenticated
    using (true);

alter table app.packages
    enable row level security;

alter table app.packages
    add constraint packages_handle_fkey foreign key (handle) references app.handle_registry(handle);

alter table app.packages
    add constraint packages_handle_partial_name_key unique (handle, partial_name);

alter table app.packages
    add constraint packages_pkey primary key (id);

grant insert (handle, partial_name) on app.packages to authenticated;