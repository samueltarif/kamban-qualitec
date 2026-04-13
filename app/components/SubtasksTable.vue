<template>
  <div v-if="isExpanded" class="bg-blue-50/20 border-l-4 border-primary-400">
    <!-- Cabeçalho de subtarefas alinhado com as colunas -->
    <div class="flex items-center gap-2 px-4 py-2 bg-neutral-50/80 border-b border-neutral-200 overflow-x-auto scrollbar-mobile">
      <!-- Checkbox header -->
      <div class="flex-shrink-0 w-4" />
      
      <!-- Título header -->
      <div class="flex-1 min-w-[200px] text-xs font-semibold text-neutral-600 uppercase tracking-wide">
        Subelemento
      </div>

      <!-- Headers dinâmicos baseados nas colunas visíveis -->
      <template v-for="col in orderedColumns" :key="col.key">
        <template v-if="isVisible(col.key) && isSubtaskColumn(col.key)">
          <div class="flex-shrink-0 min-w-[120px] text-xs font-semibold text-neutral-600 uppercase tracking-wide">
            {{ getColumnLabel(col.key) }}
          </div>
        </template>
      </template>

      <!-- Espaço para botões de ação -->
      <div class="flex-shrink-0 w-20" />
    </div>

    <!-- Lista de subtarefas -->
    <div v-if="subtasks.length > 0">
      <SubtaskRow
        v-for="subtask in sortedSubtasks"
        :key="subtask.id"
        :subtask="subtask"
        :board-id="boardId"
        :can-edit="canEdit"
        :is-selected="selectedSubtaskId === subtask.id"
        @toggle="handleToggle"
        @update="handleUpdate"
        @update-field="handleUpdateField"
        @delete="handleDelete"
        @open-details="handleOpenDetails"
      />
    </div>

    <!-- Input para criar nova subtarefa -->
    <div class="flex items-center gap-2 px-4 py-2.5 border-t border-neutral-200">
      <div class="flex-shrink-0 w-4" />
      <input
        v-if="isCreating"
        ref="createInputRef"
        v-model="newSubtaskTitle"
        type="text"
        placeholder="Nome da subtarefa..."
        class="flex-1 text-sm px-2 py-1.5 border border-primary-400 rounded focus:outline-none focus:ring-2 focus:ring-primary-400"
        @blur="cancelCreate"
        @keydown.enter="saveNewSubtask"
        @keydown.esc="cancelCreate"
      />
      <button
        v-else
        type="button"
        class="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary-600 transition-colors"
        :disabled="!canEdit"
        @click="startCreate"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Adicionar subelemento
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import { useSubtasks } from '~/composables/useSubtasks'
import { useBoardColumns } from '~/composables/useBoardColumns'
import { useTaskStatuses } from '~/composables/useTaskStatuses'
import { useTaskPriorities } from '~/composables/useTaskPriorities'
import SubtaskRow from '~/components/SubtaskRow.vue'

const props = defineProps<{
  taskId: string
  boardId: string
  isExpanded: boolean
  canEdit: boolean
}>()

const emit = defineEmits<{
  (e: 'open-details', subtaskId: string): void
}>()

const { orderedColumns, isVisible } = useBoardColumns(props.boardId)
const { statuses, fetchStatuses } = useTaskStatuses(props.boardId)
const { priorities, fetchPriorities } = useTaskPriorities(props.boardId)
const {
  subtasks,
  loading,
  creating,
  fetchSubtasks,
  createSubtask,
  toggleSubtask,
  updateSubtask,
  deleteSubtask,
} = useSubtasks(props.taskId)

const isCreating = ref(false)
const newSubtaskTitle = ref('')
const createInputRef = ref<HTMLInputElement | null>(null)
const selectedSubtaskId = ref<string | null>(null)

const sortedSubtasks = computed(() => 
  [...subtasks.value].sort((a, b) => a.sort_order - b.sort_order)
)

const subtaskColumns = ['status', 'dueDate', 'priority']

function isSubtaskColumn(key: string): boolean {
  return subtaskColumns.includes(key)
}

function getColumnLabel(key: string): string {
  const labels: Record<string, string> = {
    status: 'Status',
    dueDate: 'Data',
    priority: 'Prioridade'
  }
  return labels[key] || key
}

async function startCreate() {
  if (!props.canEdit) return
  isCreating.value = true
  await nextTick()
  createInputRef.value?.focus()
}

async function saveNewSubtask() {
  const title = newSubtaskTitle.value.trim()
  if (!title) {
    cancelCreate()
    return
  }
  
  await createSubtask(title)
  newSubtaskTitle.value = ''
  isCreating.value = false
}

function cancelCreate() {
  newSubtaskTitle.value = ''
  isCreating.value = false
}

async function handleToggle(subtaskId: string, isDone: boolean) {
  await toggleSubtask(subtaskId, isDone)
}

async function handleUpdate(subtaskId: string, title: string) {
  await updateSubtask(subtaskId, { title })
}

async function handleUpdateField(subtaskId: string, field: string, value: unknown) {
  console.log('[SubtasksTable] Updating field:', { subtaskId, field, value })
  // Não precisa fazer nada aqui - o SubtaskRow já fez a atualização otimista
  // Apenas salvar no servidor
  await updateSubtask(subtaskId, { [field]: value })
}

async function handleDelete(subtaskId: string) {
  if (confirm('Tem certeza que deseja remover esta subtarefa?')) {
    await deleteSubtask(subtaskId)
  }
}

function handleOpenDetails(subtaskId: string) {
  selectedSubtaskId.value = subtaskId
  emit('open-details', subtaskId)
}

// Carregar subtarefas e dados quando expandir
watch(() => props.isExpanded, async (expanded) => {
  if (expanded) {
    await Promise.all([
      fetchSubtasks(),
      fetchStatuses(),
      fetchPriorities()
    ])
  }
}, { immediate: true })

onMounted(async () => {
  if (props.isExpanded) {
    await Promise.all([
      fetchSubtasks(),
      fetchStatuses(),
      fetchPriorities()
    ])
  }
})
</script>

<style scoped>
.scrollbar-mobile {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

.scrollbar-mobile::-webkit-scrollbar {
  height: 6px;
}

.scrollbar-mobile::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-mobile::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

@media (min-width: 1024px) {
  .scrollbar-mobile {
    scrollbar-width: none;
  }
  
  .scrollbar-mobile::-webkit-scrollbar {
    display: none;
  }
}
</style>
