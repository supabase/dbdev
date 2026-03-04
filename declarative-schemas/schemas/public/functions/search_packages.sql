create function public.search_packages (
    handle       extensions.citext default null::extensions.citext,
    partial_name extensions.citext default null::extensions.citext
)
    returns SETOF public.packages
    language sql
    stable
    AS $function$
    select *
    from public.packages
    where
        ($1 is null or handle <% $1 or handle ~ $1)
        and
        ($2 is null or partial_name <% $2 or partial_name ~ $2)
    order by
        coalesce(extensions.similarity($1, handle), 0) + coalesce(extensions.similarity($2, partial_name), 0) desc,
        created_at desc;
$function$;