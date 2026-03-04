create schema app authorization postgres;

alter default privileges for role postgres in schema app grant select on tables to anon;

alter default privileges for role postgres in schema app grant select on tables to authenticated;

grant usage on schema app to anon;

grant usage on schema app to authenticated;