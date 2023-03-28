insert into app.packages(
    handle,
    partial_name,
    control_description,
    control_relocatable,
    control_requires,
    description_md
)
values ('supabase', 'dbdev', 'Install pacakges from the dbdev package index', false, '{}',
$pkg$
## dbdev
$pkg$
);

insert into app.package_versions(package_id, version_struct, sql)
values (
(select id from app.packages where package_name = 'supabase-dbdev'),
(0,0,1),
$pkg$

create or replace function install(package_name: text)
    returns bool
    language plpgsql
as $$
declare
    http_ext_schema regnamespace := select extnamespace::regnamespace from pg_catalog.pg_extension where extname = 'http' limit 1;
    -- status int;
    -- contents_text varchar;
    --contents json;
begin

    if http_ext_schema is null then
        raise exception using errcode='22000', message=format('dbdev requires the http extension and it is not available');
    end if;

    for status, contents_text, content_type, headers in select * from http((
            'GET',
            format(
                'https://pezkgjxgjxjiylskryan.supabase.co/rest/v1/package_versions?select=package_name,version,sql&limit=30&package_name=eq.%s',
                'supabase-dbdev'
            ),
            array[
                ('apiKey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlemtnanhnanhqaXlsc2tyeWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODAwMzA2MTUsImV4cCI6MTk5NTYwNjYxNX0.UalxTEThgxCgnkQNdmbV3c5UHjK3WueHVmN_0yVJgdI')::http_header
            ],
            null,
            null
        ))
        ...
    end for;

end;
$$;

$pkg$
);
