create table app.accounts (
    id              uuid                     not null,
    handle          app.valid_name           not null,
    is_organization boolean                  generated always as (false) stored,
    avatar_id       uuid,
    display_name    text,
    bio             text,
    contact_email   app.email_address,
    created_at      timestamp with time zone default now() not null
);

create policy accounts_select_policy on app.accounts
    for select
    to authenticated
    using (true);

alter table app.accounts
    enable row level security;

alter table app.accounts
    add constraint accounts_avatar_id_fkey foreign key (avatar_id) references storage.objects(id);

alter table app.accounts
    add constraint accounts_bio_check check (length(bio) <= 512);

alter table app.accounts
    add constraint accounts_display_name_check check (length(display_name) <= 128);

alter table app.accounts
    add constraint accounts_handle_key unique (handle);

alter table app.accounts
    add constraint accounts_id_fkey foreign key (id) references auth.users(id);

alter table app.accounts
    add constraint accounts_pkey primary key (id);

alter table app.accounts
    add constraint fk_handle_registry foreign key (handle, is_organization) references app.handle_registry(handle, is_organization);

grant update (avatar_id, bio, contact_email, display_name) on app.accounts to authenticated;