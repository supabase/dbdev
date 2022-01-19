-- app.handle_registry
grant insert
    (handle, is_organization)
    on app.handle_registry
    to authenticated;


-- app.accounts
alter table app.accounts enable row level security;

grant update
    (avatar_id, display_name, bio, contact_email)
    on app.accounts
    to authenticated;

create policy accounts_update_policy
    on app.accounts
    as permissive
    for update
    to authenticated
    using (id = auth.uid());

create policy accounts_select_policy
    on app.accounts
    as permissive
    for select
    to authenticated
    using (true);


-- app.organizations
alter table app.organizations enable row level security;

grant insert
    (handle, avatar_id, display_name, bio, contact_email)
    on app.organizations
    to authenticated;

grant update
    (avatar_id, display_name, bio, contact_email)
    on app.organizations
    to authenticated;

create policy organizations_insert_policy
    on app.organizations
    as permissive
    for insert
    to authenticated
    with check (true);

create policy organizations_update_policy
    on app.organizations
    as permissive
    for update
    to authenticated
    using (app.is_organization_maintainer(auth.uid(), id));

create policy organizations_select_policy
    on app.organizations
    as permissive
    for select
    to authenticated
    using (true);

-- app.members
alter table app.members enable row level security;

grant insert
    (organization_id, account_id, role)
    on app.members
    to authenticated;

grant delete
    on app.members
    to authenticated;

create policy members_insert_policy
    on app.members
    as permissive
    for insert
    to authenticated
    with check (app.is_organization_maintainer(auth.uid(), organization_id));

create policy members_delete_policy
    on app.members
    as permissive
    for delete
    to authenticated
    using (app.is_organization_maintainer(auth.uid(), organization_id));

create policy members_select_policy
    on app.members
    as permissive
    for select
    to authenticated
    using (true);

-- app.packages
alter table app.packages enable row level security;

grant insert (partial_name, handle)
    on app.packages
    to authenticated;

create policy package_insert_policy
    on app.packages
    as permissive
    for insert
    to authenticated
    with check (app.is_handle_maintainer(auth.uid(), handle));

create policy packages_select_policy
    on app.packages
    as permissive
    for select
    to authenticated
    using (true);

-- app.package_versions
alter table app.package_versions enable row level security;

grant insert
    (package_id, semver, object_id, upload_metadata)
    on app.package_versions
    to authenticated;

grant update
    (yanked_at)
    on app.package_versions
    to authenticated;

create policy package_versions_insert_policy
    on app.package_versions
    as permissive
    for insert
    to authenticated
    with check ( app.is_package_maintainer(auth.uid(), package_id) );

create policy package_versions_update_policy
    on app.package_versions
    as permissive
    for update
    to authenticated
    using ( app.is_package_maintainer(auth.uid(), package_id) );

create policy package_versions_select_policy
    on app.package_versions
    as permissive
    for select
    to authenticated
    using (true);

-- app.package_version_dependencies
alter table app.package_version_dependencies enable row level security;

grant insert
    (package_version_id, depends_on_package_id, depends_on_operator, depends_on_version)
    on app.package_version_dependencies
    to authenticated;

create policy package_version_dependencies_insert_policy
    on app.package_version_dependencies
    as permissive
    for insert
    to authenticated
    with check (app.is_package_version_maintainer(auth.uid(), package_version_id) );

create policy package_version_dependencies_select_policy
    on app.package_version_dependencies
    as permissive
    for select
    to authenticated
    using (true);
