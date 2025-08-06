import supabaseAdmin from '~/lib/supabase-admin'

// [Alaister]: These functions are to be called server side only
// as they bypass RLS. They will not work client side.

export async function getAllProfiles() {
  const [{ data: organizations }, { data: accounts }] = await Promise.all([
    supabaseAdmin
      .from('organizations')
      .select('handle')
      .order('created_at', { ascending: false })
      .limit(500)
      .returns<{ handle: string }[]>(),
    supabaseAdmin
      .from('accounts')
      .select('handle')
      .order('created_at', { ascending: false })
      .limit(500)
      .returns<{ handle: string }[]>(),
  ])

  return [...(organizations ?? []), ...(accounts ?? [])]
}

export async function getAllPackages() {
  const { data } = await supabaseAdmin

    .from('packages')
    .select('handle,partial_name')
    .order('created_at', { ascending: false })
    .limit(1000)
    .returns<{ handle: string; partial_name: string }[]>()

  return data ?? []
}
