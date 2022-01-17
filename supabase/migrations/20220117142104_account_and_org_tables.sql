insert into storage.buckets (id, name)
values ('avatars', 'avatars');

create table app.handle_registry(
    /*
    Enforces uniqueness of handles across orgs and accounts
    e.g. jsmith or supabase
    */
    handle app.valid_name primary key not null,
    is_organization boolean not null,
    created_at timestamp not null default (now() at time zone 'utc'),
    unique (handle, is_organization)
);

create table app.account(
    -- 1:1 with auth.users
    id uuid primary key references auth.users(id),
    handle app.valid_name not null unique,
    is_organization boolean generated always as (false) stored,
    avatar_id uuid references storage.objects(id),
    display_name varchar(128),
    bio varchar(512),
    contact_email app.email_address,
    created_at timestamp not null default (now() at time zone 'utc'),

    constraint fk_handle_registry
        foreign key (handle, is_organization)
        references app.handle_registry(handle, is_organization)
);

create table app.organization(
    id uuid primary key default uuid_generate_v4(),
    handle app.valid_name not null unique,
    is_organization boolean generated always as (true) stored,
    avatar_id uuid references storage.objects(id),
    display_name varchar(128),
    bio varchar(512),
    contact_email app.email_address,
    -- enforced so organization always have at least 1 admin member
    creator_id uuid not null references app.account(id),
    created_at timestamp not null default (now() at time zone 'utc'),

    constraint fk_handle_registry
        foreign key (handle, is_organization)
        references app.handle_registry(handle, is_organization)
);

create type app.membership_role as enum ('maintainer', 'creator');

create table app.account_in_organization(
    id uuid primary key default uuid_generate_v4(),
    organization_id uuid not null references app.organization(id),
    account_id uuid not null references app.account(id),
    member_role app.membership_role not null,
    created_at timestamp not null default (now() at time zone 'utc'),
    unique (organization_id, account_id),
    -- creator is defined on the organization table
    check (member_role <> 'creator')
);



grant select on all tables in schema app to authenticated, anon;
grant insert on all tables in schema app to authenticated;
