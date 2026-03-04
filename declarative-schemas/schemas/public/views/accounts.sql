create view public.accounts AS SELECT acc.id,
    acc.handle,
    obj.name AS avatar_path,
    acc.display_name,
    acc.bio,
    acc.contact_email,
    acc.created_at
   FROM (app.accounts acc
     LEFT JOIN storage.objects obj ON ((acc.avatar_id = obj.id)));