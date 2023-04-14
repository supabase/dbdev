create or replace function public.update_profile(
  handle app.valid_name,
  display_name text default null,
  bio text default null
)
returns void
language plpgsql
as $$
  declare
    v_is_org boolean;
  begin
    update app.accounts
      set display_name = coalesce($2, display_name),
          bio = coalesce($3, bio)
    where handle = $1;

    update app.organizations
      set display_name = coalesce($2, display_name),
          bio = coalesce($3, bio)
    where handle = $1;
  end;
$$;
