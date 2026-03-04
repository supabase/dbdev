create function app.text_to_semver (
    text
)
    returns app.semver_struct
    language sql
    immutable
    strict
    AS $function$
    with s(version) as (
        select (
            split_part($1, '.', 1),
            split_part($1, '.', 2),
            split_part(split_part(split_part($1, '.', 3), '-', 1), '+', 1)
        )::app.semver_struct
    )
    select
        case app.is_valid(s.version)
            when true then s.version
            else app.semver_exception($1)
       end
    from
        s
$function$;