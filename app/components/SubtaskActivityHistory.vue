<template>
  <div class="space-y-4">
    <h3 class="text-sm font-semibold text-neutral-700">Log de atividade</h3>
    
    <div v-if="loading" class="flex items-center justify-center py-8">
      <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
    </div>
    
    <div v-else-if="error" class="text-sm text-danger-600">
      Erro ao carregar atividades: {{ error }}
    </div>
    
    <div v-else-if="activities.length === 0" class="text-sm text-muted italic py-4">
      Nenhuma atividade registrada ainda.
    </div>
    
    <div v-else class="space-y-3 max-h-96 overflow-y-auto">
      <div
        v-for="activity in activities"
        :key="activity.id"
        class="flex gap-3 p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
      >
        <!-- Avatar do usuário -->
        <div class="flex-shrink-0">
          <div
            v-if="activity.actor?.avatar_url"
            class="w-8 h-8 rounded-full bg-neutral-200 overflow-hidden"
          >
            <img
              :src="activity.actor.avatar_url"
              :alt="activity.actor.full_name || activity.actor.email"
              class="w-full h-full object-cover"
            />
          </div>
          <div
            v-else
            class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center"
          >
            <span class="text-xs font-semibold text-primary-700">
              {{ getInitials(activity.actor?.full_name || activity.actor?.email || '?') }}
            </span>
          </div>
        </div>
        
        <!-- Conteúdo da atividade -->
        <div class="flex-1 min-w-0">
          <p class="text-sm text-neutral-800">
            {{ formatActivityMessage(activity) }}
          </p>
          <p class="text-xs text-muted mt-1">
            {{ formatDate(activity.created_at) }}
          </p>
        </div>
        
        <!-- Ícone da ação -->
        <div class="flex-shrink-0">
          <div
            class="w-6 h-6 rounded-full flex items-center justify-center"
            :class="getActionIconClass(activity.action)"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                :d="getActionIconPath(activity.action)"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useSubtaskActivity } from '~/composables/useSubtaskActivity'

const props = defineProps<{
  subtaskId: string
}>()

const { activities, loading, error, fetchActivities, formatActivityMessage } = useSubtaskActivity(props.subtaskId)

function getInitials(name: string): string {
  if (!name) return '?'
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'Agora mesmo'
  if (diffMins < 60) return `${diffMins}min atrás`
  if (diffHours < 24) return `${diffHours}h atrás`
  if (diffDays < 7) return `${diffDays}d atrás`
  
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getActionIconClass(action: string): string {
  const classes: Record<string, string> = {
    'created': 'bg-green-100 text-green-600',
    'updated_title': 'bg-blue-100 text-blue-600',
    'updated_status': 'bg-purple-100 text-purple-600',
    'updated_priority': 'bg-orange-100 text-orange-600',
    'updated_due_date': 'bg-cyan-100 text-cyan-600',
    'updated_notes': 'bg-indigo-100 text-indigo-600',
    'marked_done': 'bg-green-100 text-green-600',
    'marked_undone': 'bg-neutral-100 text-neutral-600',
    'deleted': 'bg-red-100 text-red-600'
  }
  return classes[action] || 'bg-neutral-100 text-neutral-600'
}

function getActionIconPath(action: string): string {
  const paths: Record<string, string> = {
    'created': 'M12 4v16m8-8H4',
    'updated_title': 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    'updated_status': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    'updated_priority': 'M5 10l7-7m0 0l7 7m-7-7v18',
    'updated_due_date': 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    'updated_notes': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    'marked_done': 'M5 13l4 4L19 7',
    'marked_undone': 'M6 18L18 6M6 6l12 12',
    'deleted': 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
  }
  return paths[action] || 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
}

onMounted(() => {
  fetchActivities()
})

watch(() => props.subtaskId, () => {
  fetchActivities()
})
</script>
