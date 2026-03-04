create table app.handle_registry (
    handle          app.valid_name           not null,
    is_organization boolean                  not null,
    created_at      timestamp with time zone default now() not null
);

alter table app.handle_registry
    add constraint handle_registry_handle_is_organization_key unique (handle, is_organization);

alter table app.handle_registry
    add constraint handle_registry_pkey primary key (handle);

grant insert (handle, is_organization) on app.handle_registry to authenticated;