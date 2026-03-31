import { ref, useState } from '#imports'
import type { Database } from '#shared/types/database'
import { createClient } from '@supabase/supabase-js'
import type { AuthUser } from '#shared/types/auth'

type SupabaseClient = ReturnType<typeof createClient<Database>>

interface RecentBoard {
  id: string
  name: string
  lastAccessedAt: string
}

export function useRecents() {
  function getClient(): SupabaseClient {
    if (import.meta.server) {
      throw new Error('[useRecents] Supabase client não disponível no SSR')
    }
    return useNuxtApp().$supabase as SupabaseClient
  }

  const authUser = useState<AuthUser | null>('auth:user', () => null)
  
  const recents = ref<RecentBoard[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchRecents(limit: number = 5) {
    if (!authUser.value) return

    loading.value = true
    error.value = null

    try {
      const supabase = getClient()
      const { data, error: fetchError } = await supabase
        .from('user_recent_boards')
        .select(`
          board_id,
          last_accessed_at,
          boards:board_id (
            id,
            name
          )
        `)
        .eq('user_id', authUser.value.id)
        .order('last_accessed_at', { ascending: false })
        .limit(limit)

      if (fetchError) throw fetchError

      recents.value = (data || [])
        .filter(item => item.boards)
        .map(item => ({
          id: (item.boards as any).id,
          name: (item.boards as any).name,
          lastAccessedAt: item.last_accessed_at
        }))
    } catch (e: any) {
      error.value = e.message
      console.error('Error fetching recents:', e)
    } finally {
      loading.value = false
    }
  }

  async function trackBoardAccess(boardId: string) {
    if (!authUser.value) return false

    try {
      const supabase = getClient()
      
      // Upsert: insert or update last_accessed_at
      const { error: upsertError } = await supabase
        .from('user_recent_boards')
        .upsert({
          user_id: authUser.value.id,
          board_id: boardId,
          last_accessed_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,board_id'
        })

      if (upsertError) throw upsertError

      await fetchRecents()
      return true
    } catch (e: any) {
      error.value = e.message
      console.error('Error tracking board access:', e)
      return false
    }
  }

  async function clearRecents() {
    if (!authUser.value) return false

    try {
      const supabase = getClient()
      const { error: deleteError } = await supabase
        .from('user_recent_boards')
        .delete()
        .eq('user_id', authUser.value.id)

      if (deleteError) throw deleteError

      recents.value = []
      return true
    } catch (e: any) {
      error.value = e.message
      console.error('Error clearing recents:', e)
      return false
    }
  }

  return {
    recents,
    loading,
    error,
    fetchRecents,
    trackBoardAccess,
    clearRecents
  }
}
