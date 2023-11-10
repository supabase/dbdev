grant insert (partial_name, handle, control_description, control_relocatable, control_requires)
    on app.packages
    to authenticated;

grant update (control_description, control_relocatable, control_requires)
    on app.packages
    to authenticated;

create or replace function public.publish_package(
    package_name app.valid_name,
    package_description varchar(1000),
    relocatable bool default false,
    requires text[] default '{}'
)
    returns void
    language plpgsql
as $$
declare
    account app.accounts = account from app.accounts account where id = auth.uid();
begin
    if account.handle is null then
        raise exception 'user not logged in';
    end if;

    insert into app.packages(handle, partial_name, control_description, control_relocatable, control_requires)
    values (account.handle, package_name, package_description, relocatable, requires)
    on conflict on constraint packages_handle_partial_name_key
    do update
    set control_description = excluded.control_description,
        control_relocatable = excluded.control_relocatable,
        control_requires = excluded.control_requires;
end;
$$;
