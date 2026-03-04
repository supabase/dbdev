create function app.is_valid (
    app .semver_struct
)
    returns boolean
    language sql
    immutable
    AS $function$
    select (
        ($1).major is not null
        and ($1).minor is not null
        and ($1).patch is not null
    )
$function$;