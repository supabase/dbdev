create function app.version_text_to_package_partial_name (
    version text
)
    returns app.valid_name
    language sql
    immutable
    AS $function$
    select split_part($1, '--', 2)
$function$;