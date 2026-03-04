create view public.package_versions AS SELECT pv.id,
    pv.package_id,
    pa.package_name,
    pv.version,
    pv.sql,
    pv.description_md,
    pa.control_description,
    pa.control_requires,
    pv.created_at
   FROM (app.packages pa
     JOIN app.package_versions pv ON ((pa.id = pv.package_id)));