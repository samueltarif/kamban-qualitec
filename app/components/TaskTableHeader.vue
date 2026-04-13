<template>
  <div class="sticky top-0 z-20 bg-neutral-50 border-b border-neutral-200">
    <div class="flex items-center gap-2 px-4 py-3 overflow-x-auto scrollbar-thin">
      
      <!-- Coluna de expansão (subtarefas) -->
      <div class="flex-shrink-0 w-8" />
      
      <!-- Coluna de título (sempre visível) -->
      <div 
        class="relative flex-shrink-0"
        :style="getColumnStyle('title')"
      >
        <div class="text-xs font-semibold text-neutral-600 uppercase tracking-wide px-2">
          Tarefa
        </div>
        <ColumnResizeHandle
          column-key="title"
          :initial-width="getWidth('title')"
          @resize="(w) => setWidth('title', w)"
        />
      </div>

      <!-- Colunas dinâmicas baseadas na visibilidade -->
      <template v-for="col in orderedColumns" :key="col.key">
        <div
          v-if="isVisible(col.key)"
          class="relative flex-shrink-0"
          :style="getColumnStyle(col.key)"
        >
          <div class="text-xs font-semibold text-neutral-600 uppercase tracking-wide px-2 truncate">
            {{ col.label }}
          </div>
          <ColumnResizeHandle
            :column-key="col.key"
            :initial-width="getWidth(col.key)"
            @resize="(w) => setWidth(col.key, w)"
          />
        </div>
      </template>
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBoardColumns } from '~/composables/useBoardColumns'
import { useColumnResize } from '~/composables/useColumnResize'

const props = defineProps<{
  boardId: string
}>()

const { orderedColumns, isVisible } = useBoardColumns(props.boardId)
const { getWidth, setWidth, getColumnStyle } = useColumnResize(props.boardId)
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
