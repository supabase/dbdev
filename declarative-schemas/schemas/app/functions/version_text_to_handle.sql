create function app.version_text_to_handle (
    version text
)
    returns app.valid_name
    language sql
    immutable
    AS $function$
    select split_part($1, '-', 1)
$function$;