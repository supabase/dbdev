insert into app.packages(
    handle,
    partial_name,
    control_description,
    control_relocatable,
    control_requires
)
values ('michelp', 'github-tle-installer', 'Install TLEs from github repos', false, '{}');

insert into app.package_versions(package_id, version_struct, sql, description_md)
values (
(select id from app.packages where package_name = 'michelp-github-tle-installer'),
(0,0,1),
$githubtle$
CREATE OR REPLACE FUNCTION _http_get(
	url text,
    req_headers http_header[]
	) RETURNS jsonb LANGUAGE plpgsql
AS $$
	DECLARE
    response jsonb;
    http_ext_schema regnamespace = extnamespace::regnamespace from pg_catalog.pg_extension where extname = 'http' limit 1;
	BEGIN
    EXECUTE format($stmt$
        SELECT row_to_json(x) FROM %I.http(('GET', $1, $2, NULL, NULL)::http_request) x
    $stmt$, http_ext_schema)
    INTO response
    USING url, req_headers;
    IF (response->>'status')::int != 200 THEN
        RAISE EXCEPTION 'Got status %s for URL %', (response->>'status'), url;
        RETURN false;
    END IF;
    RETURN response;
	END;
$$;

CREATE OR REPLACE FUNCTION _github_get(
	url text
	) RETURNS jsonb LANGUAGE plpgsql
AS $$
	DECLARE
	req_headers http_header[] = ARRAY[http_header('accept', 'application/vnd.github+json'),
                                      http_header('X-GitHub-Api-Version', '2022-11-28')];
	BEGIN
    RETURN _http_get(url, req_headers);
	END;
$$;

CREATE TYPE control_file_info AS (default_version text, requires text, comment text);

CREATE OR REPLACE FUNCTION _github_get_control_file_info(
    repo text, extname text
    ) RETURNS control_file_info LANGUAGE plpgsql
AS $$
DECLARE
    control_file text;
    default_version text;
    comment text;
    requires text;
    url text = format('%s/contents/%s.control', repo, extname);
    response jsonb;
BEGIN
    RAISE NOTICE 'Downloading % from %', extname, url;
    response = _github_get(url);

    control_file = convert_from(decode(response->>'content', 'base64'), 'utf8');
    default_version = coalesce((regexp_match(control_file, E'^\\s*default_version\\s*=\\s*\'([\\d.]*)\'$', 'n'))[1], '');
    requires = coalesce((regexp_match(control_file, E'^\\s*requires\\s*=\\s*\'*(.*)\'*$', 'n'))[1], '');
    comment = coalesce((regexp_match(control_file, E'^\\s*comment\\s*=\\s*\'([\\d\\s\\w]*)\'$', 'n'))[1], '');
    RETURN (default_version, requires, comment);
END;
$$;

CREATE OR REPLACE FUNCTION install_from_github(repo text, extname text default null) RETURNS bool LANGUAGE plpgsql
AS $$
    DECLARE
		response jsonb;
        content jsonb;
        control_file text;
        control_info control_file_info;
        sql_file text;
        version_files text[];
        update_files text[];
        version_re text = '%s--([\d.]+).sql';
        update_re text = '%s--([\d.]+)--([\d.]+).sql';
        version_regex text;
        update_regex_from text;
        update_regex_to text;
    BEGIN

    IF extname IS NULL THEN
        extname = (string_to_array(repo, '/'))[2];
    END IF;

    repo = format('https://api.github.com/repos/%s', repo);

    control_info = _github_get_control_file_info(repo, extname);

   pp RAISE NOTICE 'comment: %, default_version: %, requires: %',
        control_info.default_version, control_info.requires, control_info.comment;

    IF EXISTS (SELECT name from pgtle.available_extension_versions() WHERE name = extname) THEN
        RAISE NOTICE '% is already in pgtle.available_extension_versions, checking for updates:', extname;
        RETURN false;
    END IF;

    response = _github_get(format('%s/contents/', repo));

    FOR content IN SELECT jsonb_array_elements(response) LOOP
        IF content->>'name' ~ format(version_re, extname) THEN
            version_files = array_append(version_files, content->>'name');
        END IF;
        IF content->>'name' ~ format(update_re, extname) THEN
            update_files = array_append(update_files, content->>'name');
        END IF;
    END LOOP;

    FOREACH sql_file IN ARRAY coalesce(version_files, '{}'::text[]) LOOP
        version_regex = (regexp_match(sql_file, format(version_re, extname)))[1];
        IF true THEN
            RAISE NOTICE 'Installing %', sql_file;
            response = _github_get(format('%s/contents/%s', repo, sql_file));

            PERFORM pgtle.install_extension(
                extname,
                version_regex,
                control_info.comment,
                convert_from(decode(response->>'content', 'base64'), 'utf8'),
                CASE WHEN length(control_info.requires) > 0 THEN
                    (SELECT array_agg(trim(t)) FROM regexp_split_to_table(control_info.requires, ',') t)
                ELSE NULL::text[] END);
        END IF;
    END LOOP;

    FOREACH sql_file IN ARRAY coalesce(update_files, '{}'::text[]) LOOP
        RAISE NOTICE 'Installing update %', sql_file;
        response = _github_get(format('%s/contents/%s', repo, sql_file));

		update_regex_from = (regexp_matches(sql_file, format(update_re, extname)))[1];
		update_regex_to = (regexp_matches(sql_file, format(update_re, extname)))[2];

		PERFORM pgtle.install_update_path(
			extname,
			update_regex_from,
			update_regex_to,
			convert_from(decode(response->>'content', 'base64'), 'utf8'));
	END LOOP;

	PERFORM pgtle.set_default_version(extname, control_info.default_version);
    RETURN true;
    END;
$$;
$githubtle$,

$description_md$
# michelp-github-tle-installer

Install TLEs from github repos.
$description_md$
);
