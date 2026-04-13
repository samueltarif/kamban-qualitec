<template>
  <div class="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      
      <!-- Loading state -->
      <div v-if="loading" class="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
        <div class="flex flex-col items-center gap-4">
          <div class="w-12 h-12 rounded-full border-4 border-primary-400 border-t-transparent animate-spin" />
          <p class="text-body text-muted">Carregando convite...</p>
        </div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
        <div class="flex flex-col items-center gap-4 text-center">
          <div class="w-16 h-16 rounded-full bg-danger-50 flex items-center justify-center">
            <svg class="w-8 h-8 text-danger-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <h2 class="text-heading-md font-semibold text-neutral-900 mb-2">Convite inválido</h2>
            <p class="text-body-sm text-muted">{{ error }}</p>
          </div>
          <BaseButton variant="primary" @click="navigateTo('/login')">
            Ir para login
          </BaseButton>
        </div>
      </div>

      <!-- Invitation details -->
      <div v-else-if="invitation" class="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
        
        <!-- Header -->
        <div class="bg-gradient-to-br from-primary-500 to-primary-600 p-8 text-white text-center">
          <div class="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 class="text-heading-lg font-bold mb-2">Você foi convidado!</h1>
          <p class="text-body opacity-90">Para colaborar em uma tarefa</p>
        </div>

        <!-- Content -->
        <div class="p-8 space-y-6">
          
          <!-- Inviter info -->
          <div class="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg">
            <div class="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
              {{ getInitials(invitation.inviter?.full_name || invitation.inviter?.email || '') }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-label-sm text-muted">Convidado por</p>
              <p class="text-body font-medium text-neutral-900 truncate">
                {{ invitation.inviter?.full_name || invitation.inviter?.email }}
              </p>
            </div>
          </div>

          <!-- Task info -->
          <div class="space-y-3">
            <div>
              <p class="text-label-sm text-muted mb-1">Board</p>
              <p class="text-body font-medium text-neutral-900">{{ invitation.board?.name }}</p>
            </div>
            <div>
              <p class="text-label-sm text-muted mb-1">Tarefa</p>
              <p class="text-body font-semibold text-neutral-900">{{ invitation.task?.title }}</p>
              <p v-if="invitation.task?.description" class="text-body-sm text-muted mt-1">
                {{ invitation.task.description }}
              </p>
            </div>
          </div>

          <!-- Custom message -->
          <div v-if="invitation.message" class="p-4 bg-primary-50 border-l-4 border-primary-400 rounded">
            <p class="text-label-sm text-primary-700 font-medium mb-1">Mensagem do convite</p>
            <p class="text-body-sm text-neutral-700">{{ invitation.message }}</p>
          </div>

          <!-- Expiration warning -->
          <div class="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <svg class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p class="text-label-sm text-amber-900 font-medium">Convite expira em</p>
              <p class="text-body-sm text-amber-700">{{ formatExpiration(invitation.expiresAt) }}</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="space-y-3 pt-2">
            <BaseButton 
              v-if="!isAuthenticated"
              variant="primary" 
              class="w-full"
              @click="handleLoginRedirect"
            >
              Fazer login para aceitar
            </BaseButton>
            <BaseButton 
              v-else
              variant="primary" 
              class="w-full"
              :disabled="accepting"
              @click="handleAccept"
            >
              {{ accepting ? 'Aceitando...' : 'Aceitar convite' }}
            </BaseButton>
            <p class="text-label-xs text-center text-muted">
              Ao aceitar, você terá acesso ao board e será adicionado como responsável pela tarefa
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from '#imports'

definePageMeta({
  layout: false,
  middleware: []
})

const route = useRoute()
const token = route.params.token as string

const loading = ref(true)
const accepting = ref(false)
const error = ref<string | null>(null)
const invitation = ref<any>(null)
const isAuthenticated = ref(false)

onMounted(async () => {
  // Check authentication
  const supabase = useNuxtApp().$supabase as any
  const { data: { session } } = await supabase.auth.getSession()
  isAuthenticated.value = !!session

  // Load invitation
  await loadInvitation()
})

async function loadInvitation() {
  loading.value = true
  error.value = null

  try {
    const data = await $fetch(`/api/invitations/${token}`)
    invitation.value = data.invitation
  } catch (err: any) {
    console.error('[Invite Page] Error loading invitation:', err)
    
    if (err.statusCode === 404) {
      error.value = 'Este convite não existe ou foi removido.'
    } else if (err.statusCode === 410) {
      error.value = 'Este convite expirou. Solicite um novo convite ao responsável.'
    } else if (err.statusCode === 409) {
      error.value = 'Este convite já foi aceito.'
    } else {
      error.value = 'Erro ao carregar convite. Tente novamente.'
    }
  } finally {
    loading.value = false
  }
}

async function handleAccept() {
  if (!invitation.value || accepting.value) return

  accepting.value = true

  try {
    const supabase = useNuxtApp().$supabase as any
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      handleLoginRedirect()
      return
    }

    const result = await $fetch('/api/invitations/accept', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      },
      body: {
        token
      }
    })

    if (result.success) {
      // Redirect to task
      navigateTo(`/boards/${result.boardId}?task=${result.taskId}`)
    }
  } catch (err: any) {
    console.error('[Invite Page] Error accepting invitation:', err)
    
    if (err.statusCode === 403) {
      error.value = 'Este convite foi enviado para outro endereço de e-mail.'
    } else {
      error.value = 'Erro ao aceitar convite. Tente novamente.'
    }
  } finally {
    accepting.value = false
  }
}

function handleLoginRedirect() {
  // Store invitation token in localStorage to redirect after login
  if (import.meta.client) {
    localStorage.setItem('pending_invitation', token)
  }
  navigateTo(`/login?redirect=/invite/${token}`)
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
}

function formatExpiration(date: string): string {
  const exp = new Date(date)
  const now = new Date()
  const diff = exp.getTime() - now.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (days > 0) {
    return `${days} ${days === 1 ? 'dia' : 'dias'}`
  } else if (hours > 0) {
    return `${hours} ${hours === 1 ? 'hora' : 'horas'}`
  } else {
    return 'menos de 1 hora'
  }
}
</script>
