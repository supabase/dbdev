grant insert (partial_name, handle, control_description)
    on app.packages
    to authenticated;

grant update (control_description)
    on app.packages
    to authenticated;

create policy packages_update_policy
    on app.packages
    as permissive
    for update
    to authenticated
    using ( app.is_package_maintainer(auth.uid(), id) );

create or replace function public.publish_package(
    package_name app.valid_name,
    description varchar(1000),
    source text,
    description_md text,
    version text
)
    returns public.package_versions
    language plpgsql
as $$
declare
    user_id uuid = auth.uid();
    account app.accounts = account from app.accounts account where id = user_id;
    package_id uuid;
    package_version_id uuid;
begin
    -- Upsert package
    insert into app.packages(handle, partial_name, control_description)
    values (account.handle, package_name, description)
    on conflict on constraint packages_handle_partial_name_key
    do update
    set control_description = excluded.control_description
    returning id
    into package_id;

    -- Insert package_version
    insert into app.package_versions(package_id, version_struct, sql, description_md)
    values (package_id, app.text_to_semver(version), source, description_md)
    returning id
    into package_version_id;

    -- Return the package version
    return pv from public.package_versions pv where pv.id = package_version_id;
end;
$$;