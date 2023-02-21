import supabase from '~/lib/supabase'

export async function getAllProfiles() {
  const [{ data: organizations }, { data: accounts }] = await Promise.all([
    supabase
      .from('organizations')
      .select('handle')
      .order('created_at', { ascending: false })
      .limit(500)
      .returns<{ handle: string }[]>(),
    supabase
      .from('accounts')
      .select('handle')
      .order('created_at', { ascending: false })
      .limit(500)
      .returns<{ handle: string }[]>(),
  ])

  return [...(organizations ?? []), ...(accounts ?? [])]
}

export async function getAllPackages() {
  const { data } = await supabase
    .from('packages')
    .select('handle,partial_name')
    .order('created_at', { ascending: false })
    .limit(1000)
    .returns<{ handle: string; partial_name: string }[]>()

  return data ?? []
}
