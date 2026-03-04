create function app.is_handle_maintainer (
    account_id uuid,
    handle     app.valid_name
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
            where
                acc.id = $1
                and acc.handle = $2
        )
        or exists(
            select
                1
            from
                app.organizations o
                join app.members m
                    on o.id = m.organization_id
            where
                m.role = 'maintainer'
                and m.account_id = $1
                and o.handle = $2
            )
$function$;