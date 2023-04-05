-- Return API request headers
create or replace function app.api_request_headers()
    returns json
    language sql
    stable
    as
$$
    select coalesce(current_setting('request.headers', true)::json, '{}'::json);
$$;


-- Return specific API request header
create or replace function app.api_request_header(text)
    returns text
    language sql
    stable
    as
$$
    select app.api_request_headers() ->> $1
$$;


-- IP address of current API request
create or replace function app.api_request_ip()
    returns inet
    language sql
    stable
    as
$$
    select split_part(app.api_request_header('x-forwarded-for') || ',', ',', 1)::inet
$$;

-- IP address of current API request
create or replace function app.api_request_client_info()
    returns text
    language sql
    stable
    as
$$
    select app.api_request_header('x-client-info')
$$;


create table app.downloads(
    id uuid primary key default gen_random_uuid(),
    package_id uuid not null references app.packages(id),
    ip inet not null default app.api_request_ip()::inet,
    client_info text default app.api_request_client_info(),
    created_at timestamptz not null default now()
);

create index downloads_package_id
  on app.downloads (package_id);

create index downloads_created_at
  on app.downloads
  using brin(created_at);

create or replace function public.register_download(package_name text)
    returns void
    language sql
    security definer
    as
$$
  insert into app.downloads(package_id)
  select id
  from app.packages ap
  where ap.package_name = $1
$$;
