create function app.semver_to_text (
    app .semver
)
    returns text
    language sql
    immutable
    AS $function$
    select
        format('%s.%s.%s', $1.major, $1.minor, $1.patch)
$function$;