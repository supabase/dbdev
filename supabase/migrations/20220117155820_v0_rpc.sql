create function public.create_organization(
    username app.valid_name,
    display_name text = null,
    bio text = null,
    contact_email citext = null,
    avatar_id uuid = null
)
    returns public.accounts
    language plpgsql
as $$
begin
    -- Register the requested usernamee
    insert into app.username_registry(username, is_organization) values ($1, true);

    -- Create the organization
    insert into app.organizations(username, display_name, bio, contact_email, avatar_id)
    values ($1, $2, $3, $4, $5);

    -- Return the org
    return org from public.organizations org where org.username = $1;
end;
$$;

create function public.publish_package_version(
    body json,
    object_name varchar(128) -- storage.objects.name
)
    returns public.package_versions
    language plpgsql
as $$
declare
    i_name text = body ->> 'name'; -- supabase/math
    i_version text = body ->> 'version'; -- 0.1.3

    acc app.accounts = acc from app.accounts acc where id = auth.uid();

    package_username app.valid_name = app.slug_to_username(i_name);
    package_name app.valid_name = app.slug_to_package_name(i_name);
    package_id uuid;
    package_version_id uuid;
begin
    -- Upsert package
    insert into app.packages(name, username)
        values (package_name, package_username)
        on conflict do nothing
        returning id
        into package_id;

    -- Insert package_version
    insert into app.package_versions(package_id, semver, object_id, upload_metadata)
        values (
            package_id,
            app.text_to_semver(i_version),
            (
                select 
                    id 
                from
                    storage.objects
                where
                    name = object_name
                    and bucket_id = 'package_versions'
                limit
                    1
            ),
            body
        )
        returning id
        into package_version_id;

    -- Return the package version
    return pv from public.package_versions pv where pv.id = package_version_id;
end;
$$;

create function public.is_username_available(username app.valid_name)
    returns boolean
    stable
    language sql
as $$
    select
        not exists(
            select
                1
            from
                app.username_registry hr
            where
                hr.username = $1
        )
$$;
