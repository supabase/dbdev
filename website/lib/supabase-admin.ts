import { createClient } from '@supabase/supabase-js'
import { Database } from '~/data/database.types'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

// During build time, we might not have the service role key
// In that case, we'll create a client that will be used later at runtime
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-key-for-build'
)

// Helper function to check if admin operations are available
export const isAdminAvailable = () => {
  return !!process.env.SUPABASE_SERVICE_ROLE_KEY
}

export default supabaseAdmin
