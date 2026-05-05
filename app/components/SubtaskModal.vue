<template>
  <BaseModal :model-value="modelValue" :title="subtask?.title ?? 'Subtarefa'" size="lg" @update:model-value="onClose">
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="w-6 h-6 rounded-full border-2 border-primary-400 border-t-transparent animate-spin" />
    </div>

    <div v-else-if="subtask" class="space-y-6">
      <!-- Título editável -->
      <div>
        <input
          v-model="draftTitle"
          type="text"
          maxlength="500"
          placeholder="Título da subtarefa"
          :disabled="!canEdit"
          class="w-full text-xl font-semibold text-neutral-900 bg-transparent border-0 border-b-2 border-transparent focus:border-primary-400 outline-none pb-1 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          @blur="saveField('title', draftTitle)"
          @keydown.enter.prevent="saveField('title', draftTitle)"
        />
      </div>

      <!-- Grid de campos -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Status -->
        <div class="space-y-1.5">
          <label class="text-xs font-medium text-neutral-500 uppercase tracking-wide">Status</label>
          <select
            v-model="draftStatusId"
            :disabled="!canEdit"
            class="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white min-h-[44px] disabled:opacity-60 disabled:cursor-not-allowed"
            @change="saveField('status_id', draftStatusId)"
          >
            <option :value="null">Sem status</option>
            <option 
              v-for="s in statuses" 
              :key="s.id" 
              :value="s.id"
              :style="{ color: s.color }"
            >
              {{ s.name }}
            </option>
          </select>
        </div>

        <!-- Prioridade -->
        <div class="space-y-1.5">
          <label class="text-xs font-medium text-neutral-500 uppercase tracking-wide">Prioridade</label>
          <select
            v-model="draftPriorityId"
            :disabled="!canEdit"
            class="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white min-h-[44px] disabled:opacity-60 disabled:cursor-not-allowed"
            @change="saveField('priority_id', draftPriorityId)"
          >
            <option :value="null">Sem prioridade</option>
            <option 
              v-for="p in priorities" 
              :key="p.id" 
              :value="p.id"
              :style="{ color: p.color }"
            >
              {{ p.name }}
            </option>
          </select>
        </div>

        <!-- Data de início -->
        <div class="space-y-1.5">
          <label class="text-xs font-medium text-neutral-500 uppercase tracking-wide">Início</label>
          <input
            v-model="draftStartDate"
            type="date"
            :disabled="!canEdit"
            class="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white min-h-[44px] disabled:opacity-60 disabled:cursor-not-allowed"
            @change="saveField('start_date', draftStartDate || null)"
          />
        </div>

        <!-- Data de prazo -->
        <div class="space-y-1.5">
          <label class="text-xs font-medium text-neutral-500 uppercase tracking-wide">Prazo</label>
          <input
            v-model="draftDueDate"
            type="date"
            :disabled="!canEdit"
            class="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white min-h-[44px] disabled:opacity-60 disabled:cursor-not-allowed"
            @change="saveField('due_date', draftDueDate || null)"
          />
        </div>

        <!-- Orçamento -->
        <div class="space-y-1.5">
          <label class="text-xs font-medium text-neutral-500 uppercase tracking-wide">Orçamento (R$)</label>
          <input
            v-model="draftBudget"
            type="text"
            placeholder="0,00"
            :disabled="!canEdit"
            class="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white min-h-[44px] disabled:opacity-60 disabled:cursor-not-allowed"
            @blur="saveBudget"
            @keydown.enter.prevent="saveBudget"
          />
        </div>

        <!-- Responsáveis -->
        <div class="space-y-1.5">
          <label class="text-xs font-medium text-neutral-500 uppercase tracking-wide">Responsáveis</label>
          <AssigneeCell
            :task-id="subtaskId"
            :board-id="boardId"
            :initial-assignees="assignees"
            :is-subtask="true"
            @update="handleAssigneesUpdate"
          />
        </div>
      </div>

      <!-- Descrição -->
      <div class="space-y-1.5">
        <label class="text-xs font-medium text-neutral-500 uppercase tracking-wide">Descrição</label>
        <textarea
          v-model="draftDescription"
          rows="4"
          placeholder="Adicione uma descrição ou observações..."
          :disabled="!canEdit"
          class="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none disabled:opacity-60 disabled:cursor-not-allowed"
          @blur="saveField('description', draftDescription || null)"
        />
      </div>

      <!-- Anexos -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <label class="text-xs font-medium text-neutral-500 uppercase tracking-wide">
            Anexos ({{ attachments.length }})
          </label>
          <button
            v-if="canEdit"
            type="button"
            class="flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
            @click="openAttachmentModal"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Adicionar arquivo
          </button>
        </div>

        <div v-if="attachments.length > 0" class="space-y-2">
          <AttachmentItem
            v-for="attachment in attachments"
            :key="attachment.id"
            :attachment="attachment"
            :can-delete="canEdit"
            @delete="handleDeleteAttachment"
          />
        </div>
        <p v-else class="text-sm text-neutral-400 italic">Nenhum anexo</p>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-between w-full">
        <BaseButton
          v-if="canEdit"
          variant="danger"
          @click="showDeleteConfirm = true"
        >
          Excluir subtarefa
        </BaseButton>
        <BaseButton variant="ghost" @click="onClose">Fechar</BaseButton>
      </div>
    </template>
  </BaseModal>

  <!-- Modal de confirmação de exclusão -->
  <BaseModal v-model="showDeleteConfirm" title="Excluir subtarefa?" size="sm" :close-on-backdrop="false">
    <div class="space-y-4">
      <p class="text-sm text-neutral-600">
        Tem certeza que deseja excluir esta subtarefa?
      </p>
      <p class="text-sm text-neutral-500">
        Esta ação não pode ser desfeita.
      </p>
    </div>

    <template #footer>
      <BaseButton variant="ghost" @click="showDeleteConfirm = false">Cancelar</BaseButton>
      <BaseButton variant="danger" @click="confirmDelete">Excluir</BaseButton>
    </template>
  </BaseModal>

  <!-- Modal de anexos -->
  <AttachmentsModal
    v-if="showAttachmentsModal"
    v-model="showAttachmentsModal"
    entity-type="subtask"
    :entity-id="subtaskId"
    @uploaded="fetchAttachments"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useTaskStatuses } from '~/composables/useTaskStatuses'
import { useTaskPriorities } from '~/composables/useTaskPriorities'
import { useSubtaskAssignees } from '~/composables/useSubtaskAssignees'
import { useBoardPermissions } from '~/composables/useBoardPermissions'

const props = defineProps<{
  subtaskId: string
  taskId: string
  boardId: string
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'updated'): void
  (e: 'deleted', subtaskId: string): void
}>()

const supabase = useNuxtApp().$supabase as any

const subtask = ref<any>(null)
const loading = ref(false)
const showDeleteConfirm = ref(false)
const showAttachmentsModal = ref(false)

const { statuses, fetchStatuses } = useTaskStatuses(props.boardId)
const { priorities, fetchPriorities } = useTaskPriorities(props.boardId)
const { assignees, fetchAssignees } = useSubtaskAssignees(props.subtaskId)
const { canEdit, fetchUserRole } = useBoardPermissions(props.boardId)

const attachments = ref<any[]>([])

// Draft fields
const draftTitle = ref('')
const draftDescription = ref('')
const draftStatusId = ref<string | null>(null)
const draftPriorityId = ref<string | null>(null)
const draftStartDate = ref('')
const draftDueDate = ref('')
const draftBudget = ref('')

function syncDrafts() {
  if (!subtask.value) return
  draftTitle.value = subtask.value.title
  draftDescription.value = subtask.value.description ?? ''
  draftStatusId.value = subtask.value.status_id
  draftPriorityId.value = subtask.value.priority_id
  draftStartDate.value = subtask.value.start_date ?? ''
  draftDueDate.value = subtask.value.due_date ?? ''
  draftBudget.value = subtask.value.budget != null ? String(subtask.value.budget).replace('.', ',') : ''
}

watch(subtask, syncDrafts)

async function loadAllData() {
  loading.value = true
  
  try {
    await Promise.all([
      fetchSubtask(),
      fetchStatuses(),
      fetchPriorities(),
      fetchAssignees(props.subtaskId),
      fetchUserRole(),
      fetchAttachments()
    ])
  } catch (error) {
    console.error('Error loading subtask data:', error)
  } finally {
    loading.value = false
  }
}

async function fetchSubtask() {
  const { data, error } = await supabase
    .from('subtasks')
    .select('*')
    .eq('id', props.subtaskId)
    .single()
  
  if (error) throw error
  subtask.value = data
}

async function fetchAttachments() {
  const { data, error } = await supabase
    .from('attachments')
    .select('*')
    .eq('entity_type', 'subtask')
    .eq('entity_id', props.subtaskId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching attachments:', error)
    return
  }
  
  attachments.value = data || []
}

watch(() => props.modelValue, async (isOpen) => {
  if (isOpen) {
    await loadAllData()
  }
}, { immediate: true })

async function saveField(field: string, value: unknown) {
  if (!subtask.value) return
  try {
    const { error } = await supabase
      .from('subtasks')
      .update({ [field]: value })
      .eq('id', props.subtaskId)
    
    if (error) throw error
    
    subtask.value[field] = value
    emit('updated')
  } catch (err) {
    console.error('Error updating subtask:', err)
  }
}

async function saveBudget() {
  const raw = draftBudget.value.trim().replace(',', '.')
  const value = raw === '' ? null : parseFloat(raw)
  if (value !== null && isNaN(value)) return
  await saveField('budget', value)
}

function handleAssigneesUpdate(newAssignees: any[]) {
  assignees.value = newAssignees
}

function openAttachmentModal() {
  showAttachmentsModal.value = true
}

async function handleDeleteAttachment(attachmentId: string) {
  try {
    const { error } = await supabase
      .from('attachments')
      .delete()
      .eq('id', attachmentId)
    
    if (error) throw error
    
    await fetchAttachments()
  } catch (err) {
    console.error('Error deleting attachment:', err)
  }
}

async function confirmDelete() {
  try {
    const { error } = await supabase
      .from('subtasks')
      .delete()
      .eq('id', props.subtaskId)
    
    if (error) throw error
    
    showDeleteConfirm.value = false
    emit('deleted', props.subtaskId)
    emit('update:modelValue', false)
  } catch (err) {
    console.error('Error deleting subtask:', err)
  }
}

function onClose() {
  emit('update:modelValue', false)
}
</script>
