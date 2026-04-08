import { ref } from 'vue'

export interface ActivityLog {
  id: string
  actor_id: string | null
  entity_type: string
  entity_id: string
  action: string
  meta_json: Record<string, any> | null
  created_at: string
  actor?: {
    id: string
    full_name: string | null
    email: string
    avatar_url: string | null
  }
}

export function useSubtaskActivity(subtaskId: string) {
  const supabase = useNuxtApp().$supabase as any
  
  const activities = ref<ActivityLog[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchActivities() {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: fetchError } = await supabase
        .from('activity_logs')
        .select(`
          *,
          actor:profiles!activity_logs_actor_id_fkey(
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('entity_type', 'subtask')
        .eq('entity_id', subtaskId)
        .order('created_at', { ascending: false })
        .limit(50)
      
      if (fetchError) throw fetchError
      activities.value = data || []
    } catch (err: any) {
      console.error('Erro ao buscar atividades da subtarefa:', err)
      error.value = err.message
      activities.value = []
    } finally {
      loading.value = false
    }
  }

  async function logActivity(action: string, meta?: Record<string, any>) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        console.error('Usuário não autenticado')
        return
      }

      const { error: insertError } = await supabase
        .from('activity_logs')
        .insert({
          actor_id: user.id,
          entity_type: 'subtask',
          entity_id: subtaskId,
          action,
          meta_json: meta || null
        })
      
      if (insertError) throw insertError
      
      // Recarregar atividades
      await fetchActivities()
    } catch (err: any) {
      console.error('Erro ao registrar atividade:', err)
    }
  }

  function getActionLabel(action: string): string {
    const labels: Record<string, string> = {
      'created': 'criou a subtarefa',
      'updated_title': 'alterou o título',
      'updated_status': 'alterou o status',
      'updated_priority': 'alterou a prioridade',
      'updated_due_date': 'alterou a data de vencimento',
      'updated_notes': 'alterou as notas',
      'marked_done': 'marcou como concluída',
      'marked_undone': 'desmarcou como concluída',
      'deleted': 'excluiu a subtarefa'
    }
    return labels[action] || action
  }

  function formatActivityMessage(activity: ActivityLog): string {
    const actorName = activity.actor?.full_name || activity.actor?.email || 'Alguém'
    const actionLabel = getActionLabel(activity.action)
    
    let message = `${actorName} ${actionLabel}`
    
    // Adicionar detalhes do meta_json se disponível
    if (activity.meta_json) {
      const meta = activity.meta_json
      
      if (meta.old_value !== undefined && meta.new_value !== undefined) {
        message += ` de "${meta.old_value}" para "${meta.new_value}"`
      } else if (meta.value !== undefined) {
        message += `: ${meta.value}`
      }
    }
    
    return message
  }

  return {
    activities,
    loading,
    error,
    fetchActivities,
    logActivity,
    getActionLabel,
    formatActivityMessage
  }
}
