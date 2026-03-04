create table app.organizations (
    id              uuid                     default gen_random_uuid() not null,
    handle          app.valid_name           not null,
    is_organization boolean                  generated always as (true) stored,
    avatar_id       uuid,
    display_name    text,
    bio             text,
    contact_email   app.email_address,
    created_at      timestamp with time zone default now() not null
);

create trigger on_app_organization_created
    after insert on app.organizations
    for each row
    execute function app.register_organization_creator_as_member();

create policy organizations_insert_policy on app.organizations
    for insert
    to authenticated
    with check (true);

create policy organizations_select_policy on app.organizations
    for select
    to authenticated
    using (true);

alter table app.organizations
    enable row level security;

alter table app.organizations
    add constraint fk_handle_registry foreign key (handle, is_organization) references app.handle_registry(handle, is_organization);

alter table app.organizations
    add constraint organizations_avatar_id_fkey foreign key (avatar_id) references storage.objects(id);

alter table app.organizations
    add constraint organizations_bio_check check (length(bio) <= 512);

alter table app.organizations
    add constraint organizations_display_name_check check (length(display_name) <= 128);

alter table app.organizations
    add constraint organizations_handle_key unique (handle);

alter table app.organizations
    add constraint organizations_pkey primary key (id);

grant insert (avatar_id, bio, contact_email, display_name, handle) on app.organizations to authenticated;

grant update (avatar_id, bio, contact_email, display_name) on app.organizations to authenticated;