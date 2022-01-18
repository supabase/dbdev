create function public.create_organization(
    handle app.valid_name,
    display_name text = null,
    bio text = null,
    contact_email citext = null,
    avatar_id uuid = null
)
    returns public.accounts
    language plpgsql
as $$
begin
    -- Register the requested handle
    insert into app.handle_registry(handle, is_organization) values ($1, true);

    -- Create the organization
    insert into app.organizations(handle, display_name, bio, contact_email, avatar_id)
    values ($1, $2, $3, $4, $5);

    -- Return the org
    return org from public.organizations org where org.handle = $1;
end;
$$;

create function public.publish_package_version(
    body json,
    object_id uuid -- storage.objects reference to uploaded file
)
    returns public.package_versions
    language plpgsql
as $$
declare
    i_name text = body ->> 'name'; -- supabase/math
    i_version text = body ->> 'version'; -- 0.1.3

    acc app.accounts = acc from app.accounts acc where id = auth.uid();

    package_handle app.valid_name = app.version_text_to_handle(i_name);
    package_partial_name app.valid_name = app.version_text_to_package_partial_name(i_name);
    package_id uuid;
    package_version_id uuid;
begin
    -- Upsert package
    insert into app.packages(partial_name, handle)
        values (package_partial_name, package_handle)
        on conflict do nothing
        returning id
        into package_id;

    -- Insert package_version
    insert into app.package_versions(package_id, semver, object_id, upload_metadata)
        values (
            package_id,
            app.text_to_semver(i_version),
            object_id,
            body
        )
        returning id
        into package_version_id;

    -- Return the package version
    return pv from public.package_versions pv where pv.id = package_version_id;
end;
$$;
