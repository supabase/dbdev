import Head from 'next/head'
import DynamicLayout from '~/components/layouts/DynamicLayout'
import Markdown from '~/components/ui/Markdown'
import { NextPageWithLayout } from '~/lib/types'

const InstallerPage: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>Installer | The Database Package Manager</title>
      </Head>

      <Markdown>
        {`# Install dbdev

\`\`\`sql
create extension if not exists http with schema extensions;
create extension if not exists pg_tle;
drop extension if exists "supabase-dbdev";
select 
  pgtle.install_extension(
    'supabase-dbdev',
    resp.contents ->> 'version',
    'PostgreSQL package manager',
    resp.contents ->> 'sql'
  )
from http(
  (
    'GET',
    'https://api.database.dev/rest/v1/'
    || 'package_versions?select=sql,version'
    || '&package_name=eq.supabase-dbdev'
    || '&order=version.desc'
    || '&limit=1',
    array[
      ('apiKey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtdXB0cHBsZnZpaWZyYndtbXR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODAxMDczNzIsImV4cCI6MTk5NTY4MzM3Mn0.z2CN0mvO2No8wSi46Gw59DFGCTJrzM0AQKsu_5k134s')::http_header
    ],
    null,
    null
  )
) x,
lateral (
  select 
    ((row_to_json(x) -> 'content') #>> '{}')::json -> 0
) resp(contents)
where
  not exists (select true from pgtle.available_extensions() where name = 'supabase-dbdev');
create extension "supabase-dbdev";
select dbdev.install('supabase-dbdev');
drop extension if exists "supabase-dbdev";
create extension "supabase-dbdev";
\`\`\``}
      </Markdown>
    </>
  )
}

InstallerPage.getLayout = (page) => <DynamicLayout>{page}</DynamicLayout>

export default InstallerPage
