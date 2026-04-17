import { ref } from '#imports'

export interface TaskAttachmentWithSource {
  id: string
  file_name: string
  file_path: string
  mime_type: string | null
  size_bytes: number | null
  category: string | null
  description: string | null
  sort_order: number
  uploaded_by: string | null
  created_at: string
  source: 'task' | 'subtask'
  source_id: string
  source_name?: string
  uploader?: {
    id: string
    full_name: string | null
    email: string
    avatar_url: string | null
  }
}

export function useTaskAllAttachments(taskId: string) {
  const supabase = useNuxtApp().$supabase as any
  const attachments = ref<TaskAttachmentWithSource[]>([])
  const loading = ref(false)

  async function fetchAllAttachments() {
    loading.value = true
    try {
      // Buscar anexos da tarefa principal
      const { data: taskAttachments, error: taskError } = await supabase
        .from('task_attachments')
        .select(`
          *,
          uploader:uploaded_by (
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: false })

      if (taskError) {
        console.error('Erro ao buscar anexos da tarefa:', taskError)
      }

      // Buscar subtarefas da tarefa
      const { data: subtasks, error: subtasksError } = await supabase
        .from('subtasks')
        .select('id, title')
        .eq('task_id', taskId)

      if (subtasksError) {
        console.error('Erro ao buscar subtarefas:', subtasksError)
      }

      const subtaskIds = subtasks?.map((st: any) => st.id) || []
      const subtaskMap = new Map(subtasks?.map((st: any) => [st.id, st.title]) || [])

      // Buscar anexos de todas as subtarefas
      let subtaskAttachments: any[] = []
      if (subtaskIds.length > 0) {
        const { data, error: subtaskAttachmentsError } = await supabase
          .from('subtask_attachments')
          .select(`
            *,
            uploader:uploaded_by (
              id,
              full_name,
              email,
              avatar_url
            )
          `)
          .in('subtask_id', subtaskIds)
          .order('created_at', { ascending: false })

        if (subtaskAttachmentsError) {
          console.error('Erro ao buscar anexos das subtarefas:', subtaskAttachmentsError)
        } else {
          subtaskAttachments = data || []
        }
      }

      // Combinar e formatar todos os anexos
      const allAttachments: TaskAttachmentWithSource[] = []

      // Adicionar anexos da tarefa
      if (taskAttachments) {
        taskAttachments.forEach((att: any) => {
          allAttachments.push({
            ...att,
            source: 'task',
            source_id: taskId,
            source_name: 'Tarefa principal'
          })
        })
      }

      // Adicionar anexos das subtarefas
      if (subtaskAttachments) {
        subtaskAttachments.forEach((att: any) => {
          allAttachments.push({
            id: att.id,
            file_name: att.file_name,
            file_path: att.file_path,
            mime_type: att.mime_type,
            size_bytes: att.size_bytes,
            category: att.category,
            description: att.description,
            sort_order: att.sort_order,
            uploaded_by: att.uploaded_by,
            created_at: att.created_at,
            uploader: att.uploader,
            source: 'subtask',
            source_id: att.subtask_id,
            source_name: subtaskMap.get(att.subtask_id) || 'Subtarefa'
          })
        })
      }

      // Ordenar por data de criação (mais recente primeiro)
      allAttachments.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )

      attachments.value = allAttachments
    } catch (err) {
      console.error('Erro ao buscar anexos:', err)
    } finally {
      loading.value = false
    }
  }

  async function getDownloadUrl(filePath: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage
        .from('task-attachments')
        .createSignedUrl(filePath, 3600) // 1 hora

      if (error) {
        console.error('Erro ao gerar URL:', error)
        return null
      }

      return data.signedUrl
    } catch (err) {
      console.error('Erro ao gerar URL:', err)
      return null
    }
  }

  async function deleteAttachment(attachment: TaskAttachmentWithSource): Promise<boolean> {
    try {
      // Deletar do storage
      const { error: storageError } = await supabase.storage
        .from('task-attachments')
        .remove([attachment.file_path])

      if (storageError) {
        console.error('Erro ao deletar do storage:', storageError)
      }

      // Deletar do banco (tabela correta baseada na origem)
      const tableName = attachment.source === 'task' ? 'task_attachments' : 'subtask_attachments'
      const { error: dbError } = await supabase
        .from(tableName)
        .delete()
        .eq('id', attachment.id)

      if (dbError) {
        console.error('Erro ao deletar do banco:', dbError)
        return false
      }

      // Remover da lista local
      attachments.value = attachments.value.filter(a => a.id !== attachment.id)

      return true
    } catch (err) {
      console.error('Erro ao deletar anexo:', err)
      return false
    }
  }

  return {
    attachments,
    loading,
    fetchAllAttachments,
    getDownloadUrl,
    deleteAttachment
  }
}
