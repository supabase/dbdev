insert into storage.buckets (id, name)
values ('avatars', 'avatars');

create table app.username_registry(
    /*
    Enforces uniqueness of usernames across orgs and accounts
    e.g. jsmith or supabase
    */
    username app.valid_name primary key not null,
    is_organization boolean not null,
    created_at timestamp not null default (now() at time zone 'utc'),
    unique (username, is_organization)
);

create table app.accounts(
    -- 1:1 with auth.users
    id uuid primary key references auth.users(id),
    username app.valid_name not null unique,
    is_organization boolean generated always as (false) stored,
    avatar_id uuid references storage.objects(id),
    display_name varchar(128),
    bio varchar(512),
    contact_email app.email_address,
    created_at timestamp not null default (now() at time zone 'utc'),

    constraint fk_username_registry
        foreign key (username, is_organization)
        references app.username_registry(username, is_organization)
);

create or replace function app.register_account()
    returns trigger
    language plpgsql
    security definer
    as $$
    begin
        insert into app.username_registry (username, is_organization)
          values (
            new.raw_user_meta_data ->> 'username',
            false
          );

        insert into app.accounts (id, username, display_name, bio, contact_email)
          values (
            new.id,
            new.raw_user_meta_data ->> 'username',
            new.raw_user_meta_data ->> 'display_name',
            new.raw_user_meta_data ->> 'bio',
            new.raw_user_meta_data ->> 'contact_email'
          );
          return new;
    end;
    $$;

create or replace trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure app.register_account();

create table app.organizations(
    id uuid primary key default uuid_generate_v4(),
    username app.valid_name not null unique,
    is_organization boolean generated always as (true) stored,
    avatar_id uuid references storage.objects(id),
    display_name varchar(128),
    bio varchar(512),
    contact_email app.email_address,
    -- enforced so organization always have at least 1 admin member
    created_at timestamp not null default (now() at time zone 'utc'),

    constraint fk_username_registry
        foreign key (username, is_organization)
        references app.username_registry(username, is_organization)
);

create type app.membership_role as enum ('maintainer');

create table app.members(
    id uuid primary key default uuid_generate_v4(),
    organization_id uuid not null references app.organizations(id),
    account_id uuid not null references app.accounts(id),
    role app.membership_role not null,
    created_at timestamp not null default (now() at time zone 'utc'),
    unique (organization_id, account_id)
);

create or replace function app.register_organization_creator_as_member()
    returns trigger
    language plpgsql
    security definer
    as $$
    begin
        insert into app.members(organization_id, account_id, role)
        values (new.id, auth.uid(), 'maintainer');

        return new;
    end;
    $$;

create or replace trigger on_app_organization_created
    after insert on app.organizations
    for each row execute procedure app.register_organization_creator_as_member();
