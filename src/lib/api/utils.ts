import { createClient } from '@supabase/supabase-js'

export function getSupabaseAnon() {
  const key: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const url: string = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

  return createClient(url, key);
}
