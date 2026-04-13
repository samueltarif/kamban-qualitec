<template>
  <div class="flex items-center gap-2 px-4 py-3 bg-neutral-50 border-b border-neutral-100 overflow-x-auto scrollbar-thin">
    
    <!-- Coluna de expansão (subtarefas) -->
    <div class="flex-shrink-0 w-8" />
    
    <!-- Coluna de título (sempre visível) -->
    <div 
      class="relative flex-shrink-0 group/col"
      :style="getColumnStyle('title')"
    >
      <div class="text-xs font-semibold text-neutral-600 uppercase tracking-wide px-2">
        Tarefa
      </div>
      <!-- Handle de redimensionamento -->
      <div
        class="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize opacity-0 group-hover/col:opacity-100 hover:!opacity-100 transition-opacity z-10"
        :class="{ '!opacity-100 bg-primary-500': resizingColumn === 'title' }"
        @mousedown="startResize($event, 'title')"
        @touchstart="startResize($event, 'title')"
      >
        <div class="absolute -left-2 -right-2 top-0 bottom-0" />
        <div class="absolute right-0 top-0 bottom-0 w-0.5 bg-primary-400 hover:bg-primary-500" />
      </div>
    </div>

    <!-- Colunas dinâmicas baseadas na visibilidade -->
    <template v-for="col in orderedColumns" :key="col.key">
      <div
        v-if="isVisible(col.key)"
        class="relative flex-shrink-0 group/col"
        :style="getColumnStyle(col.key)"
      >
        <div class="text-xs font-semibold text-neutral-600 uppercase tracking-wide px-2 truncate">
          {{ col.label }}
        </div>
        <!-- Handle de redimensionamento -->
        <div
          class="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize opacity-0 group-hover/col:opacity-100 hover:!opacity-100 transition-opacity z-10"
          :class="{ '!opacity-100 bg-primary-500': resizingColumn === col.key }"
          @mousedown="startResize($event, col.key)"
          @touchstart="startResize($event, col.key)"
        >
          <div class="absolute -left-2 -right-2 top-0 bottom-0" />
          <div class="absolute right-0 top-0 bottom-0 w-0.5 bg-primary-400 hover:bg-primary-500" />
        </div>
      </div>
    </template>
    
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useBoardColumns } from '~/composables/useBoardColumns'
import { useColumnResize } from '~/composables/useColumnResize'

const props = defineProps<{
  boardId: string
}>()

const { orderedColumns, isVisible } = useBoardColumns(props.boardId)
const { getWidth, setWidth, getColumnStyle: getColStyle } = useColumnResize(props.boardId)

// Função helper para obter o estilo
function getColumnStyle(key: string) {
  return getColStyle(key).value
}

const resizingColumn = ref<string | null>(null)
const startX = ref(0)
const startWidth = ref(0)

function startResize(e: MouseEvent | TouchEvent, columnKey: string) {
  e.preventDefault()
  e.stopPropagation()
  
  resizingColumn.value = columnKey
  startWidth.value = getWidth(columnKey)
  
  if (e instanceof MouseEvent) {
    startX.value = e.clientX
  } else if (e instanceof TouchEvent && e.touches[0]) {
    startX.value = e.touches[0].clientX
  }
  
  document.addEventListener('mousemove', onResize)
  document.addEventListener('mouseup', stopResize)
  document.addEventListener('touchmove', onResize)
  document.addEventListener('touchend', stopResize)
  
  document.body.style.userSelect = 'none'
  document.body.style.cursor = 'col-resize'
}

function onResize(e: MouseEvent | TouchEvent) {
  if (!resizingColumn.value) return
  
  let currentX = 0
  if (e instanceof MouseEvent) {
    currentX = e.clientX
  } else if (e instanceof TouchEvent && e.touches[0]) {
    currentX = e.touches[0].clientX
  }
  
  const diff = currentX - startX.value
  const newWidth = startWidth.value + diff
  
  setWidth(resizingColumn.value, newWidth)
}

function stopResize() {
  resizingColumn.value = null
  
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
  document.removeEventListener('touchmove', onResize)
  document.removeEventListener('touchend', stopResize)
  
  document.body.style.userSelect = ''
  document.body.style.cursor = ''
}
</script>

<style scoped>
.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

.scrollbar-thin::-webkit-scrollbar {
  height: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}
</style>
