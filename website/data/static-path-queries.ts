import supabaseAdmin, { isAdminAvailable } from '~/lib/supabase-admin'

// [Alaister]: These functions are to be called server side only
// as they bypass RLS. They will not work client side.

export async function getAllProfiles() {
  // During build time, if admin client isn't available, return empty array
  if (!isAdminAvailable()) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY not available during build - skipping profile paths generation')
    return []
  }

  try {
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
  } catch (error) {
    console.error('Error fetching profiles for static paths:', error)
    return []
  }
}

export async function getAllPackages() {
  // During build time, if admin client isn't available, return empty array
  if (!isAdminAvailable()) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY not available during build - skipping package paths generation')
    return []
  }

  try {
    const { data } = await supabaseAdmin
      .from('packages')
      .select('handle,partial_name')
      .order('created_at', { ascending: false })
      .limit(1000)
      .returns<{ handle: string; partial_name: string }[]>()

    return data ?? []
  } catch (error) {
    console.error('Error fetching packages for static paths:', error)
    return []
  }
}
