create function app.simulate_login (
    email extensions.citext
)
    returns void
    language sql
    AS $function$
    /*
    Simulated JWT of logged in user
    */

    select
        set_config(
            'request.jwt.claims',
            (
                select
                    json_build_object(
                        'sub',
                        id,
                        'role',
                        'authenticated'
                    )::text
                from
                    auth.users
                where
                    email = $1
            ),
            true
        ),
        set_config('role', 'authenticated', true)
$function$;