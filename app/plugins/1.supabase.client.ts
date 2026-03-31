import { createClient } from '@supabase/supabase-js'
import type { Database } from '#shared/types/database'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const supabase = createClient<Database>(
    config.public.supabaseUrl,
    config.public.supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      }
    }
  )

  return {
    provide: { supabase }
  }
})
