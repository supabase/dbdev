create function app.semver_exception (
    version text
)
    returns app.semver_struct
    language plpgsql
    immutable
    AS $function$
begin
    raise exception using errcode='22000', message=format('Invalid semver %L', version);
end;
$function$;