import { createClient } from '@supabase/supabase-js'
import type { Database } from '#shared/types/database'
import type { H3Event } from 'h3'

export function getSupabaseClient(event: H3Event) {
  const config = useRuntimeConfig()
  
  // Get auth token from authorization header
  const authHeader = getHeader(event, 'authorization')
  const token = authHeader?.replace('Bearer ', '')
  
  const supabase = createClient<Database>(
    config.public.supabaseUrl,
    config.public.supabaseAnonKey,
    {
      global: {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      }
    }
  )
  
  return supabase
}

export async function getSupabaseUser(event: H3Event) {
  const supabase = getSupabaseClient(event)
  
  // Get token from authorization header
  const authHeader = getHeader(event, 'authorization')
  const token = authHeader?.replace('Bearer ', '')
  
  if (!token) {
    console.log('[getSupabaseUser] No token in authorization header')
    return null
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(token)
  
  if (error) {
    console.error('[getSupabaseUser] Error getting user:', error)
    return null
  }
  
  if (!user) {
    console.log('[getSupabaseUser] No user found')
    return null
  }
  
  return user
}
