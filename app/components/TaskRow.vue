<template>
  <div>
    <!-- Linha principal da tarefa -->
    <div class="border-b border-neutral-100 hover:bg-neutral-50 relative motion-interactive">
      <!-- Layout mobile: área fixa + área rolável -->
      <div class="flex lg:hidden">
        <!-- Área fixa à esquerda (seta + drag handle) -->
        <div class="flex-shrink-0 flex items-center gap-1 pl-4 pr-2 py-3 bg-white z-20 border-r border-neutral-100">
          <!-- Botão expand/collapse subtarefas - SEMPRE VISÍVEL se pode editar -->
          <button
            v-if="canEdit"
            type="button"
            class="flex-shrink-0 p-1.5 text-neutral-400 hover:text-neutral-700 active:bg-neutral-100 rounded transition-all touch-manipulation"
            :class="{ 'rotate-90': isExpanded, 'opacity-50': !hasSubtasks }"
            :title="hasSubtasks ? 'Expandir subtarefas' : 'Adicionar subtarefa'"
            @click.stop="toggleExpand"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div v-else class="flex-shrink-0 w-8" />
        </div>

        <!-- Área rolável horizontalmente -->
        <div class="flex-1 overflow-x-auto overflow-y-visible scrollbar-mobile snap-x snap-mandatory touch-pan-x">
          <div class="flex items-center gap-2 pr-4 py-3 min-h-[44px]">
            <!-- Título editável inline -->
            <div class="flex-shrink-0 snap-start" :style="getColumnStyle('title')">
              <TitleCell
                :task-id="task.id"
                :board-id="task.board_id"
                :title="currentTitle"
                @update:title="currentTitle = $event"
                @open-modal="showModal = true"
              />
            </div>

            <!-- Todas as colunas na ordem configurada -->
            <template v-for="col in orderedColumns" :key="col.key">
              <template v-if="isVisible(col.key)">
                <div class="flex-shrink-0 snap-start" :style="getColumnStyle(col.key)">
                  <TimelineCell
                    v-if="col.key === 'timeline'"
                    :task-id="task.id"
                    :start-date="currentStartDate"
                    :end-date="currentEndDate"
                    @update:start-date="currentStartDate = $event"
                    @update:end-date="currentEndDate = $event"
                  />
                  <BudgetCell
                    v-else-if="col.key === 'budget'"
                    :task-id="task.id"
                    :budget="currentBudget"
                    @update:budget="currentBudget = $event"
                  />
                  <AttachmentsCell
                    v-else-if="col.key === 'attachments'"
                    :task-id="task.id"
                  />
                  <NotesCell
                    v-else-if="col.key === 'notes'"
                    :task-id="task.id"
                    :board-id="task.board_id"
                    :note="currentNote"
                    @update:note="currentNote = $event"
                  />
                  <DueDateCell
                    v-else-if="col.key === 'dueDate'"
                    :due-date="currentEndDate"
                  />
                  <LastUpdatedCell
                    v-else-if="col.key === 'lastUpdated'"
                    :updated-at="task.updated_at"
                  />
                  <PriorityCell
                    v-else-if="col.key === 'priority'"
                    :task-id="task.id"
                    :board-id="task.board_id"
                    :priority-id="currentPriorityId"
                    @update:priority-id="currentPriorityId = $event"
                  />
                  <StatusCell
                    v-else-if="col.key === 'status'"
                    :task-id="task.id"
                    :board-id="task.board_id"
                    :status-id="currentStatusId"
                    @update:status-id="currentStatusId = $event"
                  />
                  <AssigneeCell
                    v-else-if="col.key === 'assignee'"
                    :task-id="task.id"
                    :board-id="task.board_id"
                  />
                </div>
              </template>
            </template>
          </div>
        </div>

        <!-- Indicador de scroll (gradiente) -->
        <div class="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />
      </div>

      <!-- Layout desktop: tudo em uma linha -->
      <div class="hidden lg:flex items-center gap-2 px-4 py-3 min-h-[44px]">
        <!-- Botão expand/collapse subtarefas - sempre visível se pode editar -->
        <button
          v-if="canEdit"
          type="button"
          class="flex-shrink-0 p-0.5 text-neutral-400 hover:text-neutral-700 transition-transform"
          :class="{ 'rotate-90': isExpanded, 'opacity-50': !hasSubtasks }"
          :title="hasSubtasks ? 'Expandir subtarefas' : 'Adicionar subtarefa'"
          @click="toggleExpand"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <div v-else class="flex-shrink-0 w-5" />

        <!-- Drag handle (desktop only) -->
        <div
          v-if="canEdit"
          :draggable="true"
          class="flex-shrink-0 opacity-0 hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-0.5 text-muted"
          title="Arrastar para reordenar"
          @dragstart="handleDragStart"
          @dragend="handleDragEnd"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm8-16a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
          </svg>
        </div>
        
        <!-- Título editável inline -->
        <div class="flex-shrink-0" :style="getColumnStyle('title')">
          <TitleCell
            :task-id="task.id"
            :board-id="task.board_id"
            :title="currentTitle"
            @update:title="currentTitle = $event"
            @open-modal="showModal = true"
          />
        </div>

        <!-- Todas as colunas na ordem configurada -->
        <template v-for="col in orderedColumns" :key="col.key">
          <template v-if="isVisible(col.key)">
            <div class="flex-shrink-0" :style="getColumnStyle(col.key)">
              <TimelineCell
                v-if="col.key === 'timeline'"
                :task-id="task.id"
                :start-date="currentStartDate"
                :end-date="currentEndDate"
                @update:start-date="currentStartDate = $event"
                @update:end-date="currentEndDate = $event"
              />
              <BudgetCell
                v-else-if="col.key === 'budget'"
                :task-id="task.id"
                :budget="currentBudget"
                @update:budget="currentBudget = $event"
              />
              <AttachmentsCell
                v-else-if="col.key === 'attachments'"
                :task-id="task.id"
              />
              <NotesCell
                v-else-if="col.key === 'notes'"
                :task-id="task.id"
                :board-id="task.board_id"
                :note="currentNote"
                @update:note="currentNote = $event"
              />
              <DueDateCell
                v-else-if="col.key === 'dueDate'"
                :due-date="currentEndDate"
              />
              <LastUpdatedCell
                v-else-if="col.key === 'lastUpdated'"
                :updated-at="task.updated_at"
              />
              <PriorityCell
                v-else-if="col.key === 'priority'"
                :task-id="task.id"
                :board-id="task.board_id"
                :priority-id="currentPriorityId"
                @update:priority-id="currentPriorityId = $event"
              />
              <StatusCell
                v-else-if="col.key === 'status'"
                :task-id="task.id"
                :board-id="task.board_id"
                :status-id="currentStatusId"
                @update:status-id="currentStatusId = $event"
              />
              <AssigneeCell
                v-else-if="col.key === 'assignee'"
                :task-id="task.id"
                :board-id="task.board_id"
              />
            </div>
          </template>
        </template>
      </div>

      <!-- Modal completo da tarefa -->
      <TaskModal
        v-model="showModal"
        :task-id="task.id"
        :board-id="task.board_id"
        @updated="onTaskUpdated"
        @deleted="onTaskDeleted"
      />
    </div>

    <!-- Tabela de subtarefas (aninhada) -->
    <SubtasksTable
      :task-id="task.id"
      :board-id="task.board_id"
      :is-expanded="isExpanded"
      :can-edit="canEdit"
      @open-details="handleOpenSubtaskDetails"
    />

    <!-- Painel lateral de detalhes da subtarefa -->
    <SubtaskDetailPanel
      v-model="showSubtaskPanel"
      :subtask-id="selectedSubtaskId"
      :task-id="task.id"
      :board-id="task.board_id"
      @deleted="handleSubtaskDeleted"
      @updated="handleSubtaskUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { Tables } from '#shared/types/database'
import { useBoardColumns } from '~/composables/useBoardColumns'
import { useColumnResize } from '~/composables/useColumnResize'
import { useSubtasks } from '~/composables/useSubtasks'

const props = defineProps<{
  task: Pick<Tables<'tasks'>, 'id' | 'title' | 'group_id' | 'board_id' | 'status_id' | 'priority_id' | 'due_date' | 'start_date' | 'description' | 'notes' | 'budget' | 'updated_at' | 'position'>
  canEdit?: boolean
}>()

const emit = defineEmits<{ 
  (e: 'taskUpdated', id: string): void
  (e: 'taskDeleted', id: string): void
  (e: 'dragStart'): void
  (e: 'dragEnd'): void
}>()

const showModal = ref(false)
const isExpanded = ref(false)
const showSubtaskPanel = ref(false)
const selectedSubtaskId = ref('')

const { subtasks, fetchSubtasks } = useSubtasks(props.task.id)

const hasSubtasks = computed(() => subtasks.value.length > 0)

async function toggleExpand() {
  isExpanded.value = !isExpanded.value
  // Sempre carregar subtarefas ao expandir, mesmo que não tenha nenhuma
  // Isso permite criar a primeira subtarefa
  if (isExpanded.value) {
    await fetchSubtasks()
  }
}

function handleOpenSubtaskDetails(subtaskId: string) {
  selectedSubtaskId.value = subtaskId
  showSubtaskPanel.value = true
}

function handleSubtaskDeleted() {
  fetchSubtasks()
}

function handleSubtaskUpdated() {
  console.log('[TaskRow] Subtask updated, refreshing list')
  fetchSubtasks()
}

function onTaskUpdated(patch: { field: string; value: unknown }) {
  // Sync local reactive state so the row reflects changes immediately
  if (patch.field === 'title')        currentTitle.value      = patch.value as string
  if (patch.field === 'status_id')    currentStatusId.value   = patch.value as string | null
  if (patch.field === 'priority_id')  currentPriorityId.value = patch.value as string | null
  if (patch.field === 'notes')        currentNote.value       = patch.value as string | null
  if (patch.field === 'budget')       currentBudget.value     = patch.value as number | null
  if (patch.field === 'start_date')   currentStartDate.value  = patch.value as string | null
  if (patch.field === 'due_date')     currentEndDate.value    = patch.value as string | null
  emit('taskUpdated', props.task.id)
}

function onTaskDeleted(taskId: string) {
  emit('taskDeleted', taskId)
}

function handleDragStart() {
  console.log('[TaskRow] Drag start for task:', props.task.id, props.task.title)
  emit('dragStart')
}

function handleDragEnd() {
  console.log('[TaskRow] Drag end for task:', props.task.id)
  emit('dragEnd')
}

const { orderedColumns, isVisible } = useBoardColumns(props.task.board_id)
const { getColumnStyle: getColStyle } = useColumnResize(props.task.board_id)

// Função helper para obter o estilo
function getColumnStyle(key: string) {
  return getColStyle(key).value
}

const currentTitle      = ref<string>(props.task.title)
const currentStatusId   = ref<string | null>(props.task.status_id ?? null)
const currentPriorityId = ref<string | null>(props.task.priority_id ?? null)
const currentNote       = ref<string | null>(props.task.notes ?? null)
const currentBudget     = ref<number | null>(props.task.budget ?? null)
const currentStartDate  = ref<string | null>(props.task.start_date ?? null)
const currentEndDate    = ref<string | null>(props.task.due_date ?? null)

// Carregar subtarefas ao montar para saber se tem
onMounted(async () => {
  await fetchSubtasks()
})
</script>

<style scoped>
/* Scrollbar visível em mobile, oculta em desktop */
.scrollbar-mobile {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
  -webkit-overflow-scrolling: touch;
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

.scrollbar-mobile::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.3);
}

/* Desktop: ocultar scrollbar */
@media (min-width: 1024px) {
  .scrollbar-mobile {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .scrollbar-mobile::-webkit-scrollbar {
    display: none;
  }
}

/* Touch action para permitir scroll horizontal suave */
.touch-pan-x {
  touch-action: pan-x pan-y;
}

/* Melhorar resposta ao toque em botões */
.touch-manipulation {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
