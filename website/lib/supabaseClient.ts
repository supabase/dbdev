import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { config } from './config'

let supabaseSingleton: null | SupabaseClient = null

if (supabaseSingleton === null) {
  supabaseSingleton = createClient(config.SUPABASE_URL, config.SUPABASE_KEY_ANON)
}

const supabase = supabaseSingleton as SupabaseClient

export { supabase }

export async function signUp(username: string, email: string, password: string) {
  const { user, session, error } = await supabase.auth.signUp(
    {
      email,
      password,
    },
    {
      data: {
        handle: username,
      },
    }
  )

  if (error) {
    alert(error.message)
    return error
  } else return { user, session }
}

export async function signIn(email: string, password: string) {
  const { user, session, error } = await supabase.auth.signIn({
    email,
    password,
  })

  if (error) {
    alert(error.message)
    return error
  } else return { user, session }
}
