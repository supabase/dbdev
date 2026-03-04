create function app.is_package_version_maintainer (
    account_id         uuid,
    package_version_id uuid
)
    returns boolean
    language sql
    stable
    AS $function$
    select
        app.is_package_maintainer($1, pv.package_id)
    from
        app.package_versions pv
    where
        pv.id = $2
$function$;