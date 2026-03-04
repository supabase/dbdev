create view public.members AS SELECT aio.organization_id,
    aio.account_id,
    aio.role,
    aio.created_at
   FROM app.members aio;