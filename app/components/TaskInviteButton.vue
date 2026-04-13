<template>
  <div class="relative">
    <!-- Botão de convidar -->
    <button
      @click="showModal = true"
      class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors min-h-[44px]"
      title="Convidar colaborador"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
      Convidar
    </button>

    <!-- Modal de convite -->
    <BaseModal v-model="showModal" title="Convidar para colaborar" size="md">
      <div class="space-y-4">
        <p class="text-body-sm text-muted">
          Convide alguém para colaborar nesta tarefa. A pessoa receberá um e-mail com um link de acesso.
        </p>

        <!-- Email input -->
        <div>
          <label class="text-label-md text-default block mb-2">E-mail do colaborador</label>
          <input
            v-model="inviteeEmail"
            type="email"
            placeholder="exemplo@email.com"
            class="w-full px-3 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-body-sm min-h-[44px]"
            :class="{ 'border-danger-500': emailError }"
            @input="emailError = ''"
          />
          <p v-if="emailError" class="text-label-sm text-danger-600 mt-1">{{ emailError }}</p>
        </div>

        <!-- Mensagem opcional -->
        <div>
          <label class="text-label-md text-default block mb-2">Mensagem (opcional)</label>
          <textarea
            v-model="message"
            placeholder="Adicione uma mensagem personalizada ao convite..."
            rows="3"
            class="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-body-sm resize-none"
            maxlength="500"
          />
          <p class="text-label-xs text-muted mt-1">{{ message.length }}/500 caracteres</p>
        </div>

        <!-- Success message -->
        <div v-if="successMessage" class="p-3 bg-success-50 border border-success-200 rounded-lg">
          <p class="text-label-sm text-success-700">{{ successMessage }}</p>
        </div>

        <!-- Error message -->
        <div v-if="errorMessage" class="p-3 bg-danger-50 border border-danger-200 rounded-lg">
          <p class="text-label-sm text-danger-700">{{ errorMessage }}</p>
        </div>

        <!-- Info box -->
        <div class="p-3 bg-primary-50 border border-primary-200 rounded-lg">
          <div class="flex items-start gap-2">
            <svg class="w-5 h-5 text-primary-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p class="text-label-sm text-primary-900 font-medium">O que acontece ao convidar?</p>
              <ul class="text-label-xs text-primary-700 mt-1 space-y-1 list-disc list-inside">
                <li>A pessoa receberá um e-mail com link de acesso</li>
                <li>Será adicionada ao board como visualizador</li>
                <li>Será atribuída como responsável pela tarefa</li>
                <li>O convite expira em 7 dias</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <BaseButton variant="ghost" @click="closeModal">
          Cancelar
        </BaseButton>
        <BaseButton 
          variant="primary" 
          :disabled="!inviteeEmail || sending"
          @click="handleSendInvite"
        >
          {{ sending ? 'Enviando...' : 'Enviar convite' }}
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  taskId: string
  boardId: string
}>()

const showModal = ref(false)
const inviteeEmail = ref('')
const message = ref('')
const sending = ref(false)
const emailError = ref('')
const successMessage = ref('')
const errorMessage = ref('')

async function handleSendInvite() {
  // Reset messages
  emailError.value = ''
  successMessage.value = ''
  errorMessage.value = ''

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(inviteeEmail.value)) {
    emailError.value = 'E-mail inválido'
    return
  }

  sending.value = true

  try {
    const supabase = useNuxtApp().$supabase as any
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      errorMessage.value = 'Sessão expirada. Faça login novamente.'
      return
    }

    const result = await $fetch('/api/tasks/invite', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      },
      body: {
        taskId: props.taskId,
        inviteeEmail: inviteeEmail.value.trim(),
        message: message.value.trim() || undefined
      }
    })

    if (result.success) {
      if (result.alreadyMember) {
        successMessage.value = 'Usuário já tem acesso e foi adicionado como responsável!'
      } else {
        successMessage.value = 'Convite enviado com sucesso! O colaborador receberá um e-mail.'
      }

      // Reset form after 2 seconds
      setTimeout(() => {
        closeModal()
      }, 2000)
    }
  } catch (err: any) {
    console.error('[Task Invite] Error sending invitation:', err)
    
    if (err.statusCode === 403) {
      errorMessage.value = 'Você não tem permissão para convidar colaboradores.'
    } else if (err.statusCode === 404) {
      errorMessage.value = 'Tarefa não encontrada.'
    } else {
      errorMessage.value = err.data?.message || 'Erro ao enviar convite. Tente novamente.'
    }
  } finally {
    sending.value = false
  }
}

function closeModal() {
  showModal.value = false
  inviteeEmail.value = ''
  message.value = ''
  emailError.value = ''
  successMessage.value = ''
  errorMessage.value = ''
}
</script>
