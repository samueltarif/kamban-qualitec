import { ref, useState } from '#imports'
import type { Database, Tables } from '#shared/types/database'
import { createClient } from '@supabase/supabase-js'
import type { AuthUser } from '#shared/types/auth'

type SupabaseClient = ReturnType<typeof createClient<Database>>
type Board = Tables<'boards'>

export function useBoards() {
  function getClient(): SupabaseClient {
    if (import.meta.server) throw new Error('[useBoards] SSR not supported')
    return useNuxtApp().$supabase as SupabaseClient
  }

  const authUser = useState<AuthUser | null>('auth:user', () => null)

  const boards = ref<Board[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchBoards(workspaceId?: string) {
    if (!authUser.value?.organizationId) return

    loading.value = true
    error.value = null

    try {
      const supabase = getClient()
      let query = supabase
        .from('boards')
        .select('*')
        .order('created_at', { ascending: false })

      if (workspaceId) {
        query = query.eq('workspace_id', workspaceId)
      }

      const { data, error: fetchError } = await query
      if (fetchError) throw fetchError
      boards.value = data || []
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function createBoard(payload: {
    name: string
    description?: string
    workspace_id: string
    board_type: Database['public']['Enums']['board_type']
    visibility: Database['public']['Enums']['visibility_type']
    cover_color?: string
  }) {
    if (!authUser.value) {
      error.value = 'Usuário não autenticado'
      return null
    }

    try {
      const supabase = getClient()

      // Gerar UUID no cliente para saber o board_id antes de inserir
      const boardId = crypto.randomUUID()

      console.log('[useBoards] Creating board:', {
        boardId,
        payload,
        userId: authUser.value.id
      })

      const { data, error: insertError } = await supabase
        .from('boards')
        .insert({ 
          id: boardId, 
          ...payload, 
          created_by: authUser.value.id 
        })
        .select()
        .single()

      if (insertError) {
        console.error('[useBoards] Insert error:', insertError)
        throw insertError
      }

      console.log('[useBoards] Board created:', data)

      // Adicionar criador como owner (necessário para RLS de boards privados)
      const { error: memberError } = await supabase
        .from('board_members')
        .insert({ board_id: boardId, user_id: authUser.value.id, access_role: 'owner' })

      if (memberError) {
        console.error('[useBoards] Member error:', memberError)
      }

      // Criar grupo padrão
      const { error: groupError } = await supabase
        .from('task_groups')
        .insert({ board_id: boardId, name: 'Tarefas', color: '#6366f1', sort_order: 0, is_collapsed: false })

      if (groupError) {
        console.error('[useBoards] Group error:', groupError)
      }

      await fetchBoards(payload.workspace_id)

      // Retornar o board da lista já atualizada
      return boards.value.find(b => b.id === boardId) ?? null
    } catch (e: any) {
      console.error('[useBoards] Create board error:', e)
      error.value = e.message || 'Erro ao criar quadro'
      return null
    }
  }

  async function updateBoard(id: string, updates: Partial<Pick<Board, 'name' | 'description' | 'visibility' | 'cover_color' | 'board_type'>>) {
    try {
      const supabase = getClient()
      const { error: updateError } = await supabase
        .from('boards')
        .update(updates)
        .eq('id', id)

      if (updateError) throw updateError

      const idx = boards.value.findIndex(b => b.id === id)
      if (idx !== -1) boards.value[idx] = { ...boards.value[idx], ...updates }
      return true
    } catch (e: any) {
      error.value = e.message
      return false
    }
  }

  async function deleteBoard(id: string) {
    try {
      const supabase = getClient()
      const { error: deleteError } = await supabase
        .from('boards')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      boards.value = boards.value.filter(b => b.id !== id)
      return true
    } catch (e: any) {
      error.value = e.message
      return false
    }
  }

  async function fetchBoardsByWorkspace(workspaceId: string) {
    return fetchBoards(workspaceId)
  }

  return { 
    boards, 
    loading, 
    error, 
    fetchBoards, 
    fetchBoardsByWorkspace,
    createBoard, 
    updateBoard, 
    deleteBoard 
  }
}
