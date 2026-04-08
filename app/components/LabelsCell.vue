<template>
  <div class="relative group">
    <!-- Trigger button -->
    <button
      type="button"
      @click="toggleDropdown"
      class="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-neutral-100 transition-colors min-h-[44px] lg:min-h-0"
      :class="{ 'bg-neutral-100': isOpen }"
    >
      <!-- Labels exibidas -->
      <div v-if="displayLabels.length > 0" class="flex items-center gap-1 flex-wrap">
        <span
          v-for="label in displayLabels"
          :key="label.id"
          class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white"
          :style="{ backgroundColor: label.color }"
        >
          {{ label.name }}
        </span>
        <span
          v-if="remainingCount > 0"
          class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-200 text-neutral-700"
        >
          +{{ remainingCount }}
        </span>
      </div>

      <!-- Estado vazio -->
      <span v-else class="text-sm text-muted">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      </span>
    </button>

    <!-- Dropdown -->
    <Teleport to="body">
      <div
        v-if="isOpen"
        ref="dropdownRef"
        class="fixed z-50 w-72 bg-white rounded-xl shadow-xl border border-neutral-200 overflow-hidden"
        :style="dropdownStyle"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
          <h3 class="text-sm font-semibold text-strong">Etiquetas</h3>
          <button
            type="button"
            @click="closeDropdown"
            class="p-1 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <svg class="w-4 h-4 text-muted" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Search -->
        <div class="px-4 py-3 border-b border-neutral-200">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar etiquetas..."
            class="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <!-- Labels list -->
        <div class="max-h-64 overflow-y-auto">
          <div v-if="filteredLabels.length === 0" class="px-4 py-6 text-center">
            <p class="text-sm text-muted">Nenhuma etiqueta encontrada</p>
          </div>

          <button
            v-for="label in filteredLabels"
            :key="label.id"
            type="button"
            @click="toggleLabel(label.id)"
            class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 transition-colors text-left"
          >
            <!-- Checkbox -->
            <div
              class="w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0"
              :class="isLabelSelected(label.id) ? 'bg-primary-600 border-primary-600' : 'border-neutral-300'"
            >
              <svg
                v-if="isLabelSelected(label.id)"
                class="w-3 h-3 text-white"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <!-- Label preview -->
            <span
              class="flex-1 px-2 py-1 rounded text-sm font-medium text-white truncate"
              :style="{ backgroundColor: label.color }"
            >
              {{ label.name }}
            </span>
          </button>
        </div>

        <!-- Footer - Criar nova label -->
        <div class="px-4 py-3 border-t border-neutral-200">
          <button
            type="button"
            @click="showCreateForm = !showCreateForm"
            class="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Criar nova etiqueta
          </button>

          <!-- Form de criação -->
          <div v-if="showCreateForm" class="mt-3 space-y-2">
            <input
              v-model="newLabelName"
              type="text"
              placeholder="Nome da etiqueta"
              maxlength="50"
              class="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              @keyup.enter="createNewLabel"
            />
            
            <!-- Color picker -->
            <div class="grid grid-cols-9 gap-1">
              <button
                v-for="color in defaultColors"
                :key="color"
                type="button"
                @click="newLabelColor = color"
                class="w-6 h-6 rounded border-2 transition-all"
                :class="newLabelColor === color ? 'border-neutral-900 scale-110' : 'border-transparent'"
                :style="{ backgroundColor: color }"
              />
            </div>

            <div class="flex gap-2">
              <button
                type="button"
                @click="createNewLabel"
                :disabled="!newLabelName.trim()"
                class="flex-1 px-3 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Criar
              </button>
              <button
                type="button"
                @click="cancelCreate"
                class="px-3 py-2 text-sm font-medium text-muted hover:bg-neutral-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useLabels } from '~/composables/useLabels'
import { useTaskLabels } from '~/composables/useTaskLabels'
import { useDropdownPosition } from '~/composables/useDropdownPosition'

const props = defineProps<{
  taskId: string
  boardId: string
  maxVisible?: number
}>()

const maxVisible = computed(() => props.maxVisible ?? 2)

// Composables
const { labels, defaultColors, fetchLabels, createLabel } = useLabels(props.boardId)
const { taskLabels, labelIds, fetchTaskLabels, toggleLabel: toggleTaskLabel } = useTaskLabels(props.taskId)

// State
const isOpen = ref(false)
const searchQuery = ref('')
const showCreateForm = ref(false)
const newLabelName = ref('')
const newLabelColor = ref(defaultColors[0])
const dropdownRef = ref<HTMLElement | null>(null)

// Computed
const displayLabels = computed(() => taskLabels.value.slice(0, maxVisible.value))
const remainingCount = computed(() => Math.max(0, taskLabels.value.length - maxVisible.value))

const filteredLabels = computed(() => {
  if (!searchQuery.value.trim()) return labels.value
  
  const query = searchQuery.value.toLowerCase()
  return labels.value.filter(label => 
    label.name.toLowerCase().includes(query)
  )
})

// Dropdown positioning
const { dropdownStyle, updatePosition } = useDropdownPosition(dropdownRef, isOpen)

function isLabelSelected(labelId: string): boolean {
  return labelIds.value.includes(labelId)
}

function toggleDropdown() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    searchQuery.value = ''
    showCreateForm.value = false
    updatePosition()
  }
}

function closeDropdown() {
  isOpen.value = false
  showCreateForm.value = false
}

async function toggleLabel(labelId: string) {
  await toggleTaskLabel(labelId)
}

async function createNewLabel() {
  if (!newLabelName.value.trim()) return

  const created = await createLabel(newLabelName.value, newLabelColor.value)
  if (created) {
    // Adicionar automaticamente à tarefa
    await toggleTaskLabel(created.id)
    cancelCreate()
  }
}

function cancelCreate() {
  showCreateForm.value = false
  newLabelName.value = ''
  newLabelColor.value = defaultColors[0]
}

// Click outside handler
function handleClickOutside(event: MouseEvent) {
  if (!isOpen.value) return
  
  const target = event.target as HTMLElement
  if (dropdownRef.value && !dropdownRef.value.contains(target)) {
    const trigger = target.closest('button')
    if (!trigger || !trigger.contains(event.target as Node)) {
      closeDropdown()
    }
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchLabels(),
    fetchTaskLabels(),
  ])
  
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Watch for position updates
watch(isOpen, (newValue) => {
  if (newValue) {
    setTimeout(updatePosition, 0)
  }
})
</script>
