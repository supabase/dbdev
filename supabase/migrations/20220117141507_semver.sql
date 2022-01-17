-- https://semver.org/#backusnaur-form-grammar-for-valid-semver-versions
create type app.semver_struct as (
    major smallint,
    minor smallint,
    patch smallint,
    pre_release text,
    build text -- must be ignored for precedence
);

create or replace function app.is_valid(app.semver_struct)
    returns boolean
    immutable
    language sql
as $$
    select (
        ($1).major is not null
        and ($1).minor is not null
        and ($1).patch is not null
        and (
            ($1).pre_release is null
            or ($1).pre_release ~ '^[A-z0-9]{1,255}$'
        )
        and (
            ($1).build is null
            or ($1).build ~ '^[A-z0-9\.]{1,255}$'
        )
    )
$$;

create domain app.semver
    as app.semver_struct
    check (
        app.is_valid(value)
);

-- Override Equality: operator for semver type so build is ignored
create or replace function app.compare_semver_equality(ver1 app.semver, ver2 app.semver)
  returns boolean
  immutable
  language sql
as $$
    select
        ver1.major = ver2.major
        and ver1.minor = ver2.minor
        and ver1.patch = ver2.patch
        and (
            ver1.pre_release is null and ver2.pre_release is null
            or (
                ver1.pre_release is not null and ver2.pre_release is not null
                and ver1.pre_release = ver2.pre_release
            )
        )
$$;

create operator = (
  leftarg = app.semver,
  rightarg = app.semver,
  procedure = app.compare_semver_equality,
  commutator = =,
  negator = !=,
  hashes,
  merges
);


create function app.semver_exception(version text)
    returns app.semver_struct
    immutable
    language plpgsql
as $$
begin
    raise exception using errcode='22000', message=format('Invalid semver %L', version);
end;
$$;


-- Cast from Text
create function app.text_to_semver(text)
    returns app.semver_struct
    immutable
    strict
    language sql
as $$
    with s(version) as (
        select (
            split_part($1, '.', 1),
            split_part($1, '.', 2),
            split_part(split_part(split_part($1, '.', 3), '-', 1), '+', 1),
            nullif(split_part(split_part($1, '-', 2), '+', 1), ''),
            nullif(split_part($1, '+', 2), '')
        )::app.semver_struct
    )
    select
        case app.is_valid(s.version)
            when true then s.version
            else app.semver_exception($1)
       end
    from
        s
$$;


create or replace function app.semver_to_text(app.semver)
    returns text
    immutable
    language sql
as $$
    select
        format('%s.%s.%s', $1.major, $1.minor, $1.patch)
        || case
            when $1.pre_release is null then ''
            else format('-%s', $1.pre_release)
        end
        || case
            when $1.build is null then ''
            else format('+%s', $1.build)
        end
$$;


-- Implement app.max for app.semver type
create function app.max_semver_s_func(left_ app.semver, right_ app.semver)
    returns app.semver
    language sql
as $$
    select
        case
            when left_ is null then right_
            when right_ is null then left_
            when left_ > right_ then left_
            else right_
        end;
$$;


create aggregate app.max (app.semver)
(
    sfunc = app.max_semver_s_func,
    stype = app.semver
);

/*
To completely conform to the semver spec we would also need to override
< and >, but I expect it will significantly reduce performance during dependency resolution
*/
