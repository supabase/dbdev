create function app.exception (
    message text
)
    returns text
    language plpgsql
    AS $function$
        begin
                raise exception using errcode='22000', message=message;
        end;
        $function$;