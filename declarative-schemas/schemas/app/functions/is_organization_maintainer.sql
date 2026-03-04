create function app.is_organization_maintainer (
    account_id      uuid,
    organization_id uuid
)
    returns boolean
    language sql
    stable
    AS $function$
    -- Does the currently authenticated user have permission to admin orgs and org members?
    select
        exists(
            select
                1
            from
                app.members m
            where
                m.account_id = $1
                and m.organization_id = $2
                and m.role = 'maintainer'
        )
$function$;