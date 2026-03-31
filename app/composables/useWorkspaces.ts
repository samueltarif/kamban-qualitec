import { ref, useState } from '#imports'
import type { Database, Tables } from '#shared/types/database'
import { createClient } from '@supabase/supabase-js'
import type { AuthUser } from '#shared/types/auth'

type SupabaseClient = ReturnType<typeof createClient<Database>>
type Workspace = Tables<'workspaces'>

export function useWorkspaces() {
  function getClient(): SupabaseClient {
    if (import.meta.server) {
      throw new Error('[useWorkspaces] Supabase client não disponível no SSR')
    }
    return useNuxtApp().$supabase as SupabaseClient
  }

  const authUser = useState<AuthUser | null>('auth:user', () => null)
  
  const workspaces = ref<Workspace[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchWorkspaces() {
    if (!authUser.value?.organizationId) return

    loading.value = true
    error.value = null

    try {
      const supabase = getClient()
      const { data, error: fetchError } = await supabase
        .from('workspaces')
        .select('*')
        .eq('organization_id', authUser.value.organizationId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      workspaces.value = data || []
    } catch (e: any) {
      error.value = e.message
      console.error('Error fetching workspaces:', e)
    } finally {
      loading.value = false
    }
  }

  async function createWorkspace(name: string, slug: string, visibility: Database['public']['Enums']['visibility_type'] = 'org') {
    if (!authUser.value?.organizationId) return null

    try {
      const supabase = getClient()
      const { data, error: insertError } = await supabase
        .from('workspaces')
        .insert({
          name,
          slug,
          visibility,
          organization_id: authUser.value.organizationId,
          created_by: authUser.value.id
        })
        .select()
        .single()

      if (insertError) throw insertError

      await fetchWorkspaces()
      return data
    } catch (e: any) {
      error.value = e.message
      console.error('Error creating workspace:', e)
      return null
    }
  }

  async function updateWorkspace(id: string, updates: Partial<Pick<Workspace, 'name' | 'slug' | 'visibility'>>) {
    try {
      const supabase = getClient()
      const { error: updateError } = await supabase
        .from('workspaces')
        .update(updates)
        .eq('id', id)

      if (updateError) throw updateError

      await fetchWorkspaces()
      return true
    } catch (e: any) {
      error.value = e.message
      console.error('Error updating workspace:', e)
      return false
    }
  }

  async function deleteWorkspace(id: string) {
    try {
      const supabase = getClient()
      const { error: deleteError } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      workspaces.value = workspaces.value.filter(w => w.id !== id)
      return true
    } catch (e: any) {
      error.value = e.message
      console.error('Error deleting workspace:', e)
      return false
    }
  }

  return {
    workspaces,
    loading,
    error,
    fetchWorkspaces,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace
  }
}
