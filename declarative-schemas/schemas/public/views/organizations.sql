create view public.organizations AS SELECT org.id,
    org.handle,
    obj.name AS avatar_path,
    org.display_name,
    org.bio,
    org.contact_email,
    org.created_at
   FROM (app.organizations org
     LEFT JOIN storage.objects obj ON ((org.avatar_id = obj.id)));