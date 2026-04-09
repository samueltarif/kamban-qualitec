<template>
  <!-- Loading state -->
  <LoadingState v-if="isLoading && !stats" />

  <div v-else>
    <!-- Boas-vindas -->
    <div class="mb-8">
      <h2 class="text-title-lg text-strong mb-1">{{ greeting }} 👋</h2>
      <p class="text-body-md text-subtle">Aqui está um resumo do seu trabalho hoje.</p>
    </div>

    <!-- Cards de resumo -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div
        v-for="card in summaryCards"
        :key="card.label"
        class="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow duration-[200ms]"
      >
        <div
          class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          :class="card.bg"
        >
          <span class="text-xl" aria-hidden="true">{{ card.icon }}</span>
        </div>
        <div>
          <p class="text-2xl font-bold" :class="card.color">{{ card.value }}</p>
          <p class="text-label-sm text-subtle">{{ card.label }}</p>
        </div>
      </div>
    </div>

    <!-- Seção recentes -->
    <div class="bg-white rounded-2xl shadow-sm p-6">
      <div class="flex items-center justify-between mb-5">
        <h3 class="text-headline text-strong">Quadros recentes</h3>
        <NuxtLink to="/boards" class="text-label-sm" style="color: var(--color-primary-500);">
          Ver todos
        </NuxtLink>
      </div>

      <!-- Lista de boards recentes -->
      <div v-if="recentBoards.length > 0" class="space-y-3">
        <NuxtLink
          v-for="board in recentBoards"
          :key="board.id"
          :to="`/boards/${board.id}`"
          class="flex items-center justify-between p-4 rounded-xl hover:bg-neutral-50 transition-colors duration-[150ms] group"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </div>
            <div class="min-w-0">
              <p class="text-label-md text-strong font-medium truncate">{{ board.name }}</p>
              <p class="text-micro text-muted truncate">
                {{ board.workspace_name || 'Sem área' }} • {{ board.task_count }} {{ board.task_count === 1 ? 'tarefa' : 'tarefas' }}
              </p>
            </div>
          </div>
          <svg class="w-5 h-5 text-neutral-400 group-hover:text-primary-600 transition-colors shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </NuxtLink>
      </div>

      <!-- Empty state -->
      <div v-else class="flex flex-col items-center justify-center py-12 text-center">
        <div class="w-14 h-14 bg-neutral-100 rounded-2xl flex items-center justify-center mb-4">
          <svg class="w-7 h-7 text-neutral-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
        </div>
        <p class="text-body-sm text-subtle mb-1">Nenhum quadro ainda</p>
        <p class="text-micro text-muted">Crie seu primeiro quadro para começar</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useDashboard } from '~/composables/useDashboard'
import { useAuth } from '~/composables/useAuth'

definePageMeta({ layout: 'default' })

const { user } = useAuth()
const { stats, recentBoards, isLoading, fetchStats, fetchRecentBoards, subscribeToUpdates } = useDashboard()

// Saudação baseada no horário
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
})

// Cards de resumo com dados reais
const summaryCards = computed(() => [
  { 
    label: 'Tarefas abertas',  
    value: stats.value.openTasks.toString(), 
    icon: '📋', 
    bg: 'bg-primary-50',  
    color: 'text-primary-500' 
  },
  { 
    label: 'Em andamento',     
    value: stats.value.inProgressTasks.toString(), 
    icon: '⚡', 
    bg: 'bg-warning-50',  
    color: 'text-warning-600' 
  },
  { 
    label: 'Concluídas hoje',  
    value: stats.value.completedToday.toString(), 
    icon: '✅', 
    bg: 'bg-success-50',  
    color: 'text-success-600' 
  },
  { 
    label: 'Atrasadas',        
    value: stats.value.overdueTasks.toString(), 
    icon: '🔴', 
    bg: 'bg-error-50',    
    color: 'text-error-500'   
  },
])

let unsubscribe: (() => void) | undefined

onMounted(async () => {
  if (user.value) {
    await Promise.all([
      fetchStats(),
      fetchRecentBoards()
    ])
    
    // Subscrever atualizações em tempo real
    unsubscribe = subscribeToUpdates()
  }
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})
</script>
