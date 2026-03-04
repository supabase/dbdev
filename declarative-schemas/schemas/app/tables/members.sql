create table app.members (
    id              uuid                     default extensions.uuid_generate_v4() not null,
    organization_id uuid                     not null,
    account_id      uuid                     not null,
    role            app.membership_role      not null,
    created_at      timestamp with time zone default now() not null
);

create policy members_select_policy on app.members
    for select
    to authenticated
    using (true);

alter table app.members
    enable row level security;

alter table app.members
    add constraint members_organization_id_account_id_key unique (organization_id, account_id);

alter table app.members
    add constraint members_pkey primary key (id);

alter table app.members
    add constraint members_account_id_fkey foreign key (account_id) references app.accounts(id);

alter table app.members
    add constraint members_organization_id_fkey foreign key (organization_id) references app.organizations(id);

grant delete on app.members to authenticated;

grant insert (account_id, organization_id, role) on app.members to authenticated;