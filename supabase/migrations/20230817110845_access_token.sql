create table app.access_tokens(
    id uuid not null references auth.users(id),
    token_hash bytea not null,
    token_name text not null check (length(token_name) <= 64),

    primary key (id, token_hash),
    unique (id, token_name)
);

grant insert
    (id, token_hash, token_name)
    on app.access_tokens
    to authenticated;

grant select
    (id, token_hash, token_name)
    on app.access_tokens
    to anon;

alter table app.access_tokens enable row level security;

create policy access_tokens_select_policy
    on app.access_tokens
    as permissive
    for select
    to authenticated
    using ( auth.uid() = id );

create policy access_tokens_insert_policy
    on app.access_tokens
    as permissive
    for insert
    to authenticated
    with check ( auth.uid() = id );

create policy access_tokens_delete_policy
    on app.access_tokens
    as permissive
    for delete
    to authenticated
    using ( auth.uid() = id );

create or replace function public.new_access_token(
    token_name text
)
    returns text
    language plpgsql
    strict
as $$
declare
    user_id uuid = auth.uid();
    account app.accounts = account from app.accounts account where id = user_id;
    token bytea = gen_random_bytes(16);
    token_hash bytea = pgsodium.crypto_pwhash_str(token);
    token_text text = encode(token, 'hex');
begin
    insert into app.access_tokens(id, token_hash, token_name)
        values (account.id, token_hash, token_name);

    return replace(user_id::text, '-', '') || token_text;
end;
$$;

create or replace function public.redeem_access_token(
    access_token text
)
    returns text
    language plpgsql
    security definer
    strict
as $$
declare
    user_id_text text;
    user_id uuid;
    token_text text;
    token bytea;
    token_hash bytea;
    token_valid boolean;
    now timestamp;
    one_hour_from_now timestamp;
    issued_at int;
    expiry_at int;
    jwt_secret text;
begin
    -- validate access token
    if length(access_token) != 64 then
        raise exception 'Invalid token';
    end if;

    user_id_text := substring(access_token from 1 for 32);
    user_id := substring(user_id_text from 1 for 8) || '-' ||
                   substring(user_id_text from 9 for 4) || '-' ||
                   substring(user_id_text from 13 for 4) || '-' ||
                   substring(user_id_text from 17 for 4) || '-' ||
                   substring(user_id_text from 21 for 12);
    token_text := substring(access_token from 33 for 32);
    token := decode(token_text, 'hex');
    token_hash := t.token_hash from app.access_tokens t where id = user_id;

    if token_hash is null then
        raise exception 'Invalid token';
    end if;

    token_valid := pgsodium.crypto_pwhash_str_verify(token_hash, token);

    if not token_valid then
        raise exception 'Invalid token';
    end if;

    -- Generate JWT token
    now := current_timestamp;
    one_hour_from_now := now + interval '1 hour';
    issued_at := date_part('epoch', now);
    expiry_at := date_part('epoch', one_hour_from_now);
    jwt_secret := coalesce(
        current_setting('app.settings.jwt_secret', true),
        'super-secret-jwt-token-with-at-least-32-characters-long'
    );

    return sign(json_build_object(
        'aud', 'authenticated',
        'role', 'authenticated',
        'sub', user_id,
        'iat', issued_at,
        'exp', expiry_at
    ), jwt_secret);
end;
$$;
