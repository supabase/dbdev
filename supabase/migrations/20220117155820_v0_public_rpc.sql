create function public.v0_create_account(
    handle app.valid_name,
    display_name text = null,
    bio text = null,
    contact_email citext = null,
    avatar_id uuid = null
)
    returns public.v0_account
    language plpgsql
as $$
begin
    -- Register the requested handle
    insert into app.handle_registry(handle, is_organization) values ($1, false);

    -- Create the private account
    insert into app.account(id, handle, display_name, bio, contact_email, avatar_id)
    values (auth.uid(), $1, $2, $3, $4, $5);

    -- Return the public account
    return acc from public.v0_account acc where acc.id = auth.uid();
end;
$$;


create function public.v0_create_organization(
    handle app.valid_name,
    display_name text = null,
    bio text = null,
    contact_email citext = null,
    avatar_id uuid = null
)
    returns public.v0_account
    language plpgsql
as $$
begin
    -- Register the requested handle
    insert into app.handle_registry(handle, is_organization) values ($1, true);

    -- Create the organization
    insert into app.organization(handle, display_name, bio, contact_email, avatar_id, creator_id)
    values ($1, $2, $3, $4, $5, auth.uid());

    -- Return the public account
    return org from public.v0_organization org where org.handle = $1;
end;
$$;

create function public.v0_publish_package_version(
    body json,
    object_id uuid -- storage.objects reference to uploaded file
)
    returns public.v0_package_version
    language plpgsql
as $$
declare
    i_name text = body ->> 'name'; -- supabase/math
    i_version text = body ->> 'version'; -- 0.1.3

    acc app.account = acc from app.account where id = auth.uid();

    package_handle app.valid_name = app.version_text_to_handle(i_name);
    package_partial_name app.valid_name = app.version_text_to_package_partial_name(i_name);
    package_id uuid;
    package_version_id uuid;
begin
    -- Upsert package
    insert into app.package(partial_name, handle)
        values (partial_name, account.handle)
        on conflict do nothing
        returning id
        into package_id;

    -- Insert package_version
    insert into app.package_version(package_id, semver, object_id, upload_metadata)
        values (
            package_id,
            app.text_to_semver(version),
            object_id,
            body
        )
        returning id
        into package_version_id;

    -- Return the public account
    return pv from public.v0_package_version pv where pv.id = package_version_id;
end;
$$;
