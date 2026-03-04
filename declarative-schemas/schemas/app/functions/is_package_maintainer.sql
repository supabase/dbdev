create function app.is_package_maintainer (
    account_id uuid,
    package_id uuid
)
    returns boolean
    language sql
    stable
    AS $function$
    select
        exists(
            select
                1
            from
                app.accounts acc
                join app.packages p
                    on acc.handle = p.handle
            where
                acc.id = $1
                and p.id = $2
        )
        or exists(
            -- current user is maintainer of org that owns the package
            select
                1
            from
                app.packages p
                join app.organizations o
                    on p.handle = o.handle
                join app.members m
                    on o.id = m.organization_id
            where
                m.role = 'maintainer'
                and m.account_id = $1
                and p.id = $2
            )
$function$;