create view public.package_upgrades AS SELECT pu.id,
    pu.package_id,
    pa.package_name,
    pu.from_version,
    pu.to_version,
    pu.sql,
    pu.created_at
   FROM (app.packages pa
     JOIN app.package_upgrades pu ON ((pa.id = pu.package_id)));