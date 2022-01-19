import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { config } from "./config";

let supabaseSingleton: null | SupabaseClient = null;

console.log('process.env.SUPABASE_URL', process.env.SUPABASE_URL)

if (supabaseSingleton === null) {
  supabaseSingleton = createClient(
    config.SUPABASE_URL,
    config.SUPABASE_KEY_ANON
  );
}

const supabase = supabaseSingleton as SupabaseClient;

export { supabase };
