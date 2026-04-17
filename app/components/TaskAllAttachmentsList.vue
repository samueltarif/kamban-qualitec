<template>
  <div class="space-y-4">
    <!-- Loading -->
    <div v-if="loading" class="space-y-2">
      <div v-for="i in 3" :key="i" class="h-20 bg-neutral-100 rounded-lg animate-pulse" />
    </div>

    <!-- Empty state -->
    <div v-else-if="attachments.length === 0" class="flex flex-col items-center justify-center py-12 text-neutral-500">
      <svg class="w-16 h-16 mb-4 text-neutral-300" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
      </svg>
      <p class="text-sm">Nenhum arquivo anexado</p>
      <p class="text-xs mt-1">Anexe arquivos na tarefa ou subtarefas</p>
    </div>

    <!-- Lista de arquivos agrupados por origem -->
    <div v-else class="space-y-6">
      <!-- Arquivos da tarefa principal -->
      <div v-if="taskAttachments.length > 0">
        <h3 class="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Tarefa Principal
          <span class="text-xs font-normal text-neutral-500">({{ taskAttachments.length }})</span>
        </h3>
        <div class="space-y-2">
          <AttachmentItem
            v-for="attachment in taskAttachments"
            :key="attachment.id"
            :attachment="attachment"
            @view="handleView"
            @delete="handleDelete"
          />
        </div>
      </div>

      <!-- Arquivos das subtarefas agrupados -->
      <div v-for="(group, subtaskId) in subtaskGroups" :key="subtaskId">
        <h3 class="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          {{ group.name }}
          <span class="text-xs font-normal text-neutral-500">({{ group.attachments.length }})</span>
        </h3>
        <div class="space-y-2">
          <AttachmentItem
            v-for="attachment in group.attachments"
            :key="attachment.id"
            :attachment="attachment"
            @view="handleView"
            @delete="handleDelete"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useTaskAllAttachments, type TaskAttachmentWithSource } from '~/composables/useTaskAllAttachments'

const props = defineProps<{
  taskId: string
}>()

const { attachments, loading, fetchAllAttachments, getDownloadUrl, deleteAttachment } = useTaskAllAttachments(props.taskId)

const taskAttachments = computed(() => 
  attachments.value.filter(a => a.source === 'task')
)

const subtaskGroups = computed(() => {
  const groups: Record<string, { name: string; attachments: TaskAttachmentWithSource[] }> = {}
  
  attachments.value
    .filter(a => a.source === 'subtask')
    .forEach(attachment => {
      if (!groups[attachment.source_id]) {
        groups[attachment.source_id] = {
          name: attachment.source_name || 'Subtarefa',
          attachments: []
        }
      }
      groups[attachment.source_id].attachments.push(attachment)
    })
  
  return groups
})

async function handleView(attachment: TaskAttachmentWithSource) {
  const url = await getDownloadUrl(attachment.file_path)
  if (!url) return

  const isImage = attachment.mime_type?.startsWith('image/')
  const isPdf = attachment.mime_type === 'application/pdf'

  if (isImage || isPdf) {
    window.open(url, '_blank')
  } else {
    const a = document.createElement('a')
    a.href = url
    a.download = attachment.file_name
    a.click()
  }
}

async function handleDelete(attachment: TaskAttachmentWithSource) {
  if (!confirm('Tem certeza que deseja remover este anexo?')) return
  
  await deleteAttachment(attachment)
}

onMounted(() => {
  fetchAllAttachments()
})
</script>
