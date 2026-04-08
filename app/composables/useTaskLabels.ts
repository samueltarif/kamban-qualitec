import { ref, computed } from 'vue'
import type { Database } from '#shared/types/database'

type Label = Database['public']['Tables']['labels']['Row']
type TaskLabel = Database['public']['Tables']['task_labels']['Row']

export function useTaskLabels(taskId: string) {
  const { $supabase } = useNuxtApp()
  const taskLabels = ref<Label[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const labelIds = computed(() => taskLabels.value.map(l => l.id))

  async function fetchTaskLabels(): Promise<void> {
    if (!taskId) return

    isLoading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await $supabase
        .from('task_labels')
        .select(`
          label_id,
          labels (*)
        `)
        .eq('task_id', taskId)

      if (fetchError) throw fetchError

      // Extrair os labels da resposta
      taskLabels.value = (data || [])
        .map((item: any) => item.labels)
        .filter(Boolean) as Label[]
    } catch (e: any) {
      error.value = e.message
      console.error('[useTaskLabels] Erro ao buscar labels da tarefa:', e)
    } finally {
      isLoading.value = false
    }
  }

  async function addLabel(labelId: string): Promise<boolean> {
    if (!taskId || !labelId) return false

    // Verificar se já existe
    if (labelIds.value.includes(labelId)) {
      return true
    }

    isLoading.value = true
    error.value = null

    try {
      const { error: insertError } = await $supabase
        .from('task_labels')
        .insert({
          task_id: taskId,
          label_id: labelId,
        })

      if (insertError) throw insertError

      // Buscar o label completo para adicionar ao array
      const { data: labelData, error: labelError } = await $supabase
        .from('labels')
        .select('*')
        .eq('id', labelId)
        .single()

      if (labelError) throw labelError

      if (labelData) {
        taskLabels.value.push(labelData)
      }

      return true
    } catch (e: any) {
      error.value = e.message
      console.error('[useTaskLabels] Erro ao adicionar label:', e)
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function removeLabel(labelId: string): Promise<boolean> {
    if (!taskId || !labelId) return false

    isLoading.value = true
    error.value = null

    try {
      const { error: deleteError } = await $supabase
        .from('task_labels')
        .delete()
        .eq('task_id', taskId)
        .eq('label_id', labelId)

      if (deleteError) throw deleteError

      taskLabels.value = taskLabels.value.filter(l => l.id !== labelId)
      return true
    } catch (e: any) {
      error.value = e.message
      console.error('[useTaskLabels] Erro ao remover label:', e)
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function toggleLabel(labelId: string): Promise<boolean> {
    if (labelIds.value.includes(labelId)) {
      return await removeLabel(labelId)
    } else {
      return await addLabel(labelId)
    }
  }

  async function setLabels(newLabelIds: string[]): Promise<boolean> {
    if (!taskId) return false

    isLoading.value = true
    error.value = null

    try {
      // Remover todos os labels atuais
      const { error: deleteError } = await $supabase
        .from('task_labels')
        .delete()
        .eq('task_id', taskId)

      if (deleteError) throw deleteError

      // Adicionar os novos labels
      if (newLabelIds.length > 0) {
        const inserts = newLabelIds.map(labelId => ({
          task_id: taskId,
          label_id: labelId,
        }))

        const { error: insertError } = await $supabase
          .from('task_labels')
          .insert(inserts)

        if (insertError) throw insertError
      }

      // Recarregar os labels
      await fetchTaskLabels()
      return true
    } catch (e: any) {
      error.value = e.message
      console.error('[useTaskLabels] Erro ao definir labels:', e)
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    taskLabels: readonly(taskLabels),
    labelIds,
    isLoading: readonly(isLoading),
    error: readonly(error),
    fetchTaskLabels,
    addLabel,
    removeLabel,
    toggleLabel,
    setLabels,
  }
}
