<template>
  <div
    class="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary-400 active:bg-primary-600 transition-colors z-10 group/resize"
    :class="{ 'bg-primary-500': isResizing }"
    @mousedown="startResize"
    @touchstart="startResize"
  >
    <!-- Área de toque maior para mobile -->
    <div class="absolute -left-2 -right-2 top-0 bottom-0" />
    
    <!-- Indicador visual no hover -->
    <div class="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-500 rounded-full opacity-0 group-hover/resize:opacity-100 transition-opacity" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  columnKey: string
  initialWidth: number
}>()

const emit = defineEmits<{
  (e: 'resize', width: number): void
  (e: 'resize-end'): void
}>()

const isResizing = ref(false)
const startX = ref(0)
const startWidth = ref(0)

function startResize(e: MouseEvent | TouchEvent) {
  e.preventDefault()
  e.stopPropagation()
  
  isResizing.value = true
  startWidth.value = props.initialWidth
  
  if (e instanceof MouseEvent) {
    startX.value = e.clientX
  } else if (e instanceof TouchEvent && e.touches[0]) {
    startX.value = e.touches[0].clientX
  }
  
  // Adicionar listeners globais
  document.addEventListener('mousemove', onResize)
  document.addEventListener('mouseup', stopResize)
  document.addEventListener('touchmove', onResize)
  document.addEventListener('touchend', stopResize)
  
  // Prevenir seleção de texto durante o resize
  document.body.style.userSelect = 'none'
  document.body.style.cursor = 'col-resize'
}

function onResize(e: MouseEvent | TouchEvent) {
  if (!isResizing.value) return
  
  let currentX = 0
  if (e instanceof MouseEvent) {
    currentX = e.clientX
  } else if (e instanceof TouchEvent && e.touches[0]) {
    currentX = e.touches[0].clientX
  }
  
  const diff = currentX - startX.value
  const newWidth = startWidth.value + diff
  
  emit('resize', newWidth)
}

function stopResize() {
  if (!isResizing.value) return
  
  isResizing.value = false
  
  // Remover listeners globais
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
  document.removeEventListener('touchmove', onResize)
  document.removeEventListener('touchend', stopResize)
  
  // Restaurar cursor e seleção
  document.body.style.userSelect = ''
  document.body.style.cursor = ''
  
  emit('resize-end')
}
</script>
