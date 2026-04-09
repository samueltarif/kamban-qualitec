<template>
  <!-- Loading state -->
  <LoadingState v-if="isLoading && !stats" label="Carregando dashboard..." />

  <div v-else>
    <!-- Boas-vindas -->
    <div class="mb-8">
      <h2 class="text-title-lg text-strong mb-1 flex items-center gap-2">
        {{ greeting }} <HighFiveEmoji size="1.5rem" />
      </h2>
      <p class="text-body-md text-subtle">Aqui está um resumo do seu trabalho hoje.</p>
    </div>

    <!-- Cards de resumo -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <DashboardStatCard
        v-for="card in summaryCards"
        :key="card.label"
        :label="card.label"
        :value="card.value"
        :icon="card.icon"
        :bg-class="card.bg"
        :color-class="card.color"
      />
    </div>

    <!-- Seção recentes -->
    <DashboardRecentBoards :boards="recentBoards" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useAuth } from '~/composables/useAuth'

definePageMeta({ layout: 'default' })

const { user } = useAuth()

// Estado local
const isLoading = ref(false)
const stats = ref({
  openTasks: 0,
  inProgressTasks: 0,
  completedToday: 0,
  overdueTasks: 0
})
const recentBoards = ref([])

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

onMounted(async () => {
  if (user.value) {
    isLoading.value = true
    // TODO: Buscar dados reais do dashboard
    // Por enquanto, deixar com valores zerados
    isLoading.value = false
  }
})
</script>
