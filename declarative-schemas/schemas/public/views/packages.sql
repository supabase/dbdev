create view public.packages AS SELECT pa.id,
    pa.package_name,
    pa.handle,
    pa.partial_name,
    newest_ver.version AS latest_version,
    newest_ver.description_md,
    pa.control_description,
    pa.control_requires,
    pa.created_at
   FROM app.packages pa,
    LATERAL ( SELECT pv.id,
            pv.package_id,
            pv.version_struct,
            pv.version,
            pv.sql,
            pv.description_md,
            pv.created_at
           FROM app.package_versions pv
          WHERE (pv.package_id = pa.id)
          ORDER BY pv.version_struct
         LIMIT 1) newest_ver;