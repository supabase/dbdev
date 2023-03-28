create schema math if not exsits;

create function math.add(int, int)
    returns int
    immutable
    strict
    language sql
as $$
    select $1 + $2
$$;
