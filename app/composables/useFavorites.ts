import { ref, useState } from '#imports'
import type { Tables, Database } from '#shared/types/database'
import { createClient } from '@supabase/supabase-js'
import type { AuthUser } from '#shared/types/auth'

type SupabaseClient = ReturnType<typeof createClient<Database>>

interface FavoriteBoard {
  id: string
  name: string
}

export function useFavorites() {
  function getClient(): SupabaseClient {
    if (import.meta.server) {
      throw new Error('[useFavorites] Supabase client não disponível no SSR')
    }
    return useNuxtApp().$supabase as SupabaseClient
  }

  const authUser = useState<AuthUser | null>('auth:user', () => null)
  
  const favorites = ref<FavoriteBoard[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchFavorites() {
    if (!authUser.value) return

    loading.value = true
    error.value = null

    try {
      const supabase = getClient()
      const { data, error: fetchError } = await supabase
        .from('user_favorites')
        .select(`
          board_id,
          boards:board_id (
            id,
            name
          )
        `)
        .eq('user_id', authUser.value.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      favorites.value = (data || [])
        .filter(item => item.boards)
        .map(item => ({
          id: (item.boards as any).id,
          name: (item.boards as any).name
        }))
    } catch (e: any) {
      error.value = e.message
      console.error('Error fetching favorites:', e)
    } finally {
      loading.value = false
    }
  }

  async function addFavorite(boardId: string) {
    if (!authUser.value) return false

    try {
      const supabase = getClient()
      const { error: insertError } = await supabase
        .from('user_favorites')
        .insert({
          user_id: authUser.value.id,
          board_id: boardId
        })

      if (insertError) throw insertError

      await fetchFavorites()
      return true
    } catch (e: any) {
      error.value = e.message
      console.error('Error adding favorite:', e)
      return false
    }
  }

  async function removeFavorite(boardId: string) {
    if (!authUser.value) return false

    try {
      const supabase = getClient()
      const { error: deleteError } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', authUser.value.id)
        .eq('board_id', boardId)

      if (deleteError) throw deleteError

      await fetchFavorites()
      return true
    } catch (e: any) {
      error.value = e.message
      console.error('Error removing favorite:', e)
      return false
    }
  }

  async function isFavorite(boardId: string): Promise<boolean> {
    if (!authUser.value) return false

    try {
      const supabase = getClient()
      const { data, error: checkError } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', authUser.value.id)
        .eq('board_id', boardId)
        .single()

      if (checkError && checkError.code !== 'PGRST116') throw checkError

      return !!data
    } catch (e: any) {
      console.error('Error checking favorite:', e)
      return false
    }
  }

  async function toggleFavorite(boardId: string) {
    const isCurrentlyFavorite = await isFavorite(boardId)
    
    if (isCurrentlyFavorite) {
      return await removeFavorite(boardId)
    } else {
      return await addFavorite(boardId)
    }
  }

  return {
    favorites,
    loading,
    error,
    fetchFavorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite
  }
}
