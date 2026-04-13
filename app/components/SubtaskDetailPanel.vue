<template>
  <BaseDrawer
    :model-value="modelValue"
    title="Detalhes da Subtarefa"
    size="lg"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p class="mt-2 text-sm text-muted">Carregando...</p>
      </div>
    </div>

    <div v-else-if="subtask" class="space-y-6">
      <!-- Título editável -->
      <div>
        <label class="text-label-sm text-muted block mb-2">Título</label>
        <input
          v-model="localTitle"
          type="text"
          class="w-full text-lg font-semibold px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
          @blur="saveTitle"
          @keydown.enter="saveTitle"
        />
      </div>

      <!-- Checkbox concluída -->
      <div class="flex items-center gap-2">
        <input
          v-model="localIsDone"
          type="checkbox"
          class="w-5 h-5 rounded border-neutral-300 text-primary-500 focus:ring-2 focus:ring-primary-400 cursor-pointer"
          @change="toggleDone"
        />
        <label class="text-sm text-default cursor-pointer" @click="toggleDoneFromLabel">
          Marcar como concluída
        </label>
      </div>

      <!-- Status -->
      <div v-if="statuses.length > 0">
        <label class="text-label-sm text-muted block mb-2">Status</label>
        <select
          v-model="localStatusId"
          class="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
          @change="saveStatus"
        >
          <option :value="null">Sem status</option>
          <option v-for="status in statuses" :key="status.id" :value="status.id">
            {{ status.name }}
          </option>
        </select>
      </div>

      <!-- Prioridade -->
      <div v-if="priorities.length > 0">
        <label class="text-label-sm text-muted block mb-2">Prioridade</label>
        <select
          v-model="localPriorityId"
          class="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
          @change="savePriority"
        >
          <option :value="null">Sem prioridade</option>
          <option v-for="priority in priorities" :key="priority.id" :value="priority.id">
            {{ priority.name }}
          </option>
        </select>
      </div>

      <!-- Data de vencimento -->
      <div>
        <label class="text-label-sm text-muted block mb-2">Data de vencimento</label>
        <input
          v-model="localDueDate"
          type="date"
          class="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
          @change="saveDueDate"
        />
      </div>

      <!-- Descrição/Notas -->
      <div>
        <label class="text-label-sm text-muted block mb-2">Notas</label>
        <textarea
          v-model="localNotes"
          rows="4"
          placeholder="Adicione notas sobre esta subtarefa..."
          class="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
          @blur="saveNotes"
        />
      </div>

      <!-- Datas de criação e atualização -->
      <div class="text-xs text-muted space-y-1">
        <p>Criada em: {{ formatDate(subtask.created_at) }}</p>
        <p>Atualizada em: {{ formatDate(subtask.updated_at) }}</p>
      </div>

      <!-- Log de atividade -->
      <div class="pt-4 border-t border-neutral-200">
        <SubtaskActivityHistory :subtask-id="props.subtaskId" />
      </div>

      <!-- Botão deletar -->
      <div class="pt-4 border-t border-neutral-200">
        <button
          type="button"
          class="w-full px-4 py-2.5 text-sm font-medium text-danger-600 bg-danger-50 rounded-lg hover:bg-danger-100 transition-colors"
          @click="handleDelete"
        >
          Remover subtarefa
        </button>
      </div>
    </div>

    <div v-else class="flex items-center justify-center py-12">
      <p class="text-sm text-muted">Subtarefa não encontrada</p>
    </div>
  </BaseDrawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useSubtasks } from '~/composables/useSubtasks'
import { useTaskStatuses } from '~/composables/useTaskStatuses'
import { useTaskPriorities } from '~/composables/useTaskPriorities'
import { useSubtaskActivity } from '~/composables/useSubtaskActivity'
import SubtaskActivityHistory from '~/components/SubtaskActivityHistory.vue'

const props = defineProps<{
  modelValue: boolean
  subtaskId: string
  taskId: string
  boardId: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'deleted'): void
  (e: 'updated'): void
}>()

const { subtasks, loading, updateSubtask, deleteSubtask, fetchSubtasks, toggleSubtask } = useSubtasks(props.taskId)
const { statuses, fetchStatuses } = useTaskStatuses(props.boardId)
const { priorities, fetchPriorities } = useTaskPriorities(props.boardId)
const { logActivity } = useSubtaskActivity(props.subtaskId)

const subtask = ref<any>(null)
const localTitle = ref('')
const localNotes = ref('')
const localStatusId = ref<string | null>(null)
const localPriorityId = ref<string | null>(null)
const localDueDate = ref('')
const localIsDone = ref(false)

// Carregar dados da subtarefa
watch(() => [props.subtaskId, props.modelValue] as const, async ([id, isOpen]) => {
  if (id && isOpen) {
    await Promise.all([
      fetchSubtasks(),
      fetchStatuses(),
      fetchPriorities()
    ])
    
    subtask.value = subtasks.value.find(s => s.id === id)
    if (subtask.value) {
      localTitle.value = subtask.value.title
      localNotes.value = subtask.value.notes || ''
      localStatusId.value = subtask.value.status_id
      localPriorityId.value = subtask.value.priority_id
      localDueDate.value = subtask.value.due_date || ''
      localIsDone.value = subtask.value.is_done
    }
  }
}, { immediate: true })

async function saveTitle() {
  if (localTitle.value.trim() && localTitle.value !== subtask.value?.title) {
    const oldValue = subtask.value?.title
    console.log('[SubtaskDetailPanel] Saving title:', { old: oldValue, new: localTitle.value.trim() })
    
    // Atualização otimista instantânea
    if (subtask.value) {
      subtask.value.title = localTitle.value.trim()
    }
    
    try {
      // Salvar no servidor
      await updateSubtask(props.subtaskId, { title: localTitle.value.trim() })
      console.log('[SubtaskDetailPanel] Title saved successfully')
      
      // Registrar atividade
      await logActivity('updated_title', {
        old_value: oldValue,
        new_value: localTitle.value.trim()
      })
      
      // Notificar que foi atualizado
      emit('updated')
    } catch (error) {
      console.error('[SubtaskDetailPanel] Error saving title:', error)
      // Reverter em caso de erro
      if (subtask.value && oldValue) {
        subtask.value.title = oldValue
        localTitle.value = oldValue
      }
    }
  }
}

async function saveNotes() {
  if (localNotes.value !== subtask.value?.notes) {
    const oldValue = subtask.value?.notes
    console.log('[SubtaskDetailPanel] Saving notes')
    
    // Atualização otimista instantânea
    if (subtask.value) {
      subtask.value.notes = localNotes.value
    }
    
    try {
      // Salvar no servidor
      await updateSubtask(props.subtaskId, { notes: localNotes.value })
      console.log('[SubtaskDetailPanel] Notes saved successfully')
      
      // Registrar atividade
      await logActivity('updated_notes')
    } catch (error) {
      console.error('[SubtaskDetailPanel] Error saving notes:', error)
      // Reverter em caso de erro
      if (subtask.value) {
        subtask.value.notes = oldValue
        localNotes.value = oldValue || ''
      }
    }
  }
}

async function saveStatus() {
  const oldValue = subtask.value?.status_id
  const statusName = statuses.value.find(s => s.id === localStatusId.value)?.name
  const oldStatusName = statuses.value.find(s => s.id === oldValue)?.name
  
  console.log('[SubtaskDetailPanel] Saving status:', { old: oldStatusName, new: statusName })
  
  // Atualização otimista instantânea
  if (subtask.value) {
    subtask.value.status_id = localStatusId.value
  }
  
  // Notificar IMEDIATAMENTE para atualizar a UI
  emit('updated')
  
  try {
    // Salvar no servidor em background
    await updateSubtask(props.subtaskId, { status_id: localStatusId.value })
    console.log('[SubtaskDetailPanel] Status saved successfully')
    
    // Registrar atividade
    await logActivity('updated_status', {
      old_value: oldStatusName || 'Sem status',
      new_value: statusName || 'Sem status'
    })
  } catch (error) {
    console.error('[SubtaskDetailPanel] Error saving status:', error)
    // Reverter em caso de erro
    if (subtask.value) {
      subtask.value.status_id = oldValue
      localStatusId.value = oldValue
    }
    // Notificar novamente para reverter a UI
    emit('updated')
  }
}

async function savePriority() {
  const oldValue = subtask.value?.priority_id
  const priorityName = priorities.value.find(p => p.id === localPriorityId.value)?.name
  const oldPriorityName = priorities.value.find(p => p.id === oldValue)?.name
  
  console.log('[SubtaskDetailPanel] Saving priority:', { old: oldPriorityName, new: priorityName })
  
  // Atualização otimista instantânea
  if (subtask.value) {
    subtask.value.priority_id = localPriorityId.value
  }
  
  // Notificar IMEDIATAMENTE para atualizar a UI
  emit('updated')
  
  try {
    // Salvar no servidor em background
    await updateSubtask(props.subtaskId, { priority_id: localPriorityId.value })
    console.log('[SubtaskDetailPanel] Priority saved successfully')
    
    // Registrar atividade
    await logActivity('updated_priority', {
      old_value: oldPriorityName || 'Sem prioridade',
      new_value: priorityName || 'Sem prioridade'
    })
  } catch (error) {
    console.error('[SubtaskDetailPanel] Error saving priority:', error)
    // Reverter em caso de erro
    if (subtask.value) {
      subtask.value.priority_id = oldValue
      localPriorityId.value = oldValue
    }
    // Notificar novamente para reverter a UI
    emit('updated')
  }
}

async function saveDueDate() {
  const oldValue = subtask.value?.due_date
  console.log('[SubtaskDetailPanel] Saving due date:', { old: oldValue, new: localDueDate.value })
  
  // Atualização otimista instantânea
  if (subtask.value) {
    subtask.value.due_date = localDueDate.value || null
  }
  
  // Notificar IMEDIATAMENTE para atualizar a UI
  emit('updated')
  
  try {
    // Salvar no servidor em background
    await updateSubtask(props.subtaskId, { due_date: localDueDate.value || null })
    console.log('[SubtaskDetailPanel] Due date saved successfully')
    
    // Registrar atividade
    await logActivity('updated_due_date', {
      old_value: oldValue || 'Sem data',
      new_value: localDueDate.value || 'Sem data'
    })
  } catch (error) {
    console.error('[SubtaskDetailPanel] Error saving due date:', error)
    // Reverter em caso de erro
    if (subtask.value) {
      subtask.value.due_date = oldValue
      localDueDate.value = oldValue || ''
    }
    // Notificar novamente para reverter a UI
    emit('updated')
  }
}

async function toggleDone() {
  if (subtask.value) {
    const oldValue = subtask.value.is_done
    console.log('[SubtaskDetailPanel] Toggling done:', { old: oldValue, new: localIsDone.value })
    
    // Atualização otimista instantânea - o v-model já atualizou localIsDone
    subtask.value.is_done = localIsDone.value
    
    // Notificar IMEDIATAMENTE para atualizar a UI
    emit('updated')
    
    try {
      // Salvar no servidor em background
      await toggleSubtask(props.subtaskId, localIsDone.value)
      console.log('[SubtaskDetailPanel] Done status saved successfully')
      
      // Registrar atividade
      await logActivity(localIsDone.value ? 'marked_done' : 'marked_undone')
    } catch (error) {
      console.error('[SubtaskDetailPanel] Error toggling done:', error)
      // Reverter em caso de erro
      subtask.value.is_done = oldValue
      localIsDone.value = oldValue
      // Notificar novamente para reverter a UI
      emit('updated')
    }
  }
}

function toggleDoneFromLabel() {
  // Quando clica no label, inverte o valor
  localIsDone.value = !localIsDone.value
  toggleDone()
}

async function handleDelete() {
  if (confirm('Tem certeza que deseja remover esta subtarefa?')) {
    await deleteSubtask(props.subtaskId)
    emit('update:modelValue', false)
    emit('deleted')
  }
}

function formatDate(dateString: string): string {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
