<template>
  <div class="space-y-4">
    <!-- Gráfico de colunas -->
    <div class="relative pt-8 pb-4">
      <!-- Grid de fundo (linhas horizontais) -->
      <div class="absolute inset-0 flex flex-col justify-between pointer-events-none">
        <div class="border-t border-neutral-200"></div>
        <div class="border-t border-neutral-200"></div>
        <div class="border-t border-neutral-200"></div>
        <div class="border-t border-neutral-200"></div>
        <div class="border-t border-neutral-200"></div>
      </div>

      <!-- Label do eixo Y -->
      <div class="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 origin-center">
        <span class="text-xs text-neutral-400 font-medium">Contagem</span>
      </div>

      <!-- Valores do eixo Y -->
      <div class="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-neutral-400 pr-2">
        <span>{{ maxCount }}</span>
        <span>{{ Math.floor(maxCount * 0.75) }}</span>
        <span>{{ Math.floor(maxCount * 0.5) }}</span>
        <span>{{ Math.floor(maxCount * 0.25) }}</span>
        <span>0</span>
      </div>

      <!-- Container das colunas -->
      <div class="flex items-end justify-around gap-4 h-64 ml-12">
        <div
          v-for="assignee in assignees"
          :key="assignee.userId"
          class="flex flex-col items-center gap-3 flex-1 max-w-[120px] relative"
        >
          <!-- Valor acima da coluna -->
          <div class="text-lg font-bold text-neutral-700 absolute" :style="{ bottom: `calc(${getColumnHeight(assignee.taskCount)} + 80px)` }">
            {{ assignee.taskCount }}
          </div>

          <!-- Coluna (barra vertical) -->
          <div class="w-full flex flex-col items-center justify-end" :style="{ height: '100%' }">
            <div
              class="w-20 bg-gradient-to-t from-[#4C9AFF] to-[#6FB1FF] rounded-t-lg transition-all duration-300 hover:from-[#0073ea] hover:to-[#4C9AFF] cursor-pointer relative group"
              :style="{ height: getColumnHeight(assignee.taskCount) }"
            >
              <!-- Tooltip on hover -->
              <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div class="bg-neutral-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap">
                  {{ assignee.taskCount }} {{ assignee.taskCount === 1 ? 'tarefa' : 'tarefas' }}
                </div>
              </div>
            </div>
          </div>

          <!-- Avatar -->
          <div
            v-if="assignee.userAvatar"
            class="w-12 h-12 rounded-full bg-cover bg-center border-2 border-white shadow-md shrink-0 -mt-2"
            :style="{ backgroundImage: `url(${assignee.userAvatar})` }"
          ></div>
          <div
            v-else
            class="w-12 h-12 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-900 flex items-center justify-center text-white text-base font-semibold border-2 border-white shadow-md shrink-0 -mt-2"
          >
            {{ getInitials(assignee.userName) }}
          </div>

          <!-- Nome (truncado) -->
          <span class="text-xs text-neutral-600 font-medium text-center truncate w-full max-w-[100px]">
            {{ assignee.userName }}
          </span>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-if="!assignees.length"
      class="text-center py-12 text-neutral-400"
    >
      <svg class="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
      <p class="text-sm font-medium">Nenhum responsável encontrado</p>
      <p class="text-xs mt-1">Atribua tarefas aos membros da equipe</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from '#imports'
import type { AssigneeData } from '~/composables/useDashboard'

const props = defineProps<{
  assignees: AssigneeData[]
}>()

/**
 * Calcula a altura máxima para normalizar as colunas
 */
const maxCount = computed(() => {
  if (!props.assignees.length) return 0
  const max = Math.max(...props.assignees.map(a => a.taskCount))
  // Arredondar para cima para o próximo múltiplo de 5
  return Math.ceil(max / 5) * 5 || 5
})

/**
 * Calcula a altura da coluna em pixels
 */
function getColumnHeight(count: number): string {
  if (maxCount.value === 0) return '20px'
  
  // Altura máxima do gráfico é 200px (h-64 = 256px - espaço para avatar/nome)
  const maxHeight = 200
  const percentage = count / maxCount.value
  const height = Math.max(percentage * maxHeight, 20) // Mínimo 20px
  
  return `${height}px`
}

/**
 * Retorna as iniciais do nome do usuário
 */
function getInitials(name: string): string {
  if (!name) return '?'
  
  const parts = name.trim().split(' ')
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase()
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}
</script>

<style scoped>
/* Animação suave ao carregar */
@keyframes slideUp {
  from {
    transform: scaleY(0);
    transform-origin: bottom;
  }
  to {
    transform: scaleY(1);
    transform-origin: bottom;
  }
}

.w-full {
  animation: slideUp 0.6s ease-out;
}
</style>
