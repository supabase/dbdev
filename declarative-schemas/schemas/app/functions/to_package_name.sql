create function app.to_package_name (
    handle       app.valid_name,
    partial_name app.valid_name
)
    returns text
    language sql
    immutable
    AS $function$
    select format('%s-%s', $1, $2)
$function$;