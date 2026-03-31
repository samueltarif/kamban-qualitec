<template>
  <div class="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
    <div class="w-full max-w-sm">

      <div class="text-center mb-10">
        <div class="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-2xl shadow-md mb-5">
          <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 class="text-title-md text-strong mb-1">Nova senha</h1>
        <p class="text-body-sm text-muted">Escolha uma senha segura</p>
      </div>

      <div class="bg-white rounded-2xl shadow-lg p-8">
        <div v-if="done" class="text-center py-4">
          <p class="text-body-sm text-strong font-medium mb-4">Senha atualizada com sucesso.</p>
          <NuxtLink to="/login" class="text-label-sm font-medium" style="color: var(--color-primary-500);">
            Ir para o login
          </NuxtLink>
        </div>

        <form v-else @submit.prevent="handleSubmit" novalidate>
          <div class="mb-4">
            <label for="password" class="text-label-md text-default block mb-1.5">Nova senha</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              autocomplete="new-password"
              placeholder="Mínimo 8 caracteres"
              class="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-body-sm text-strong placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all duration-[150ms]"
              :class="{ 'border-error-400': errors.password }"
            />
            <p v-if="errors.password" class="text-micro mt-1.5" style="color: var(--color-error-500);">{{ errors.password }}</p>
          </div>

          <div class="mb-6">
            <label for="confirm" class="text-label-md text-default block mb-1.5">Confirmar senha</label>
            <input
              id="confirm"
              v-model="form.confirm"
              type="password"
              autocomplete="new-password"
              placeholder="Repita a senha"
              class="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-body-sm text-strong placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all duration-[150ms]"
              :class="{ 'border-error-400': errors.confirm }"
            />
            <p v-if="errors.confirm" class="text-micro mt-1.5" style="color: var(--color-error-500);">{{ errors.confirm }}</p>
          </div>

          <p v-if="errors.general" class="text-micro mb-4" style="color: var(--color-error-500);">{{ errors.general }}</p>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-primary text-white font-semibold py-3 rounded-xl shadow-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-[150ms]"
          >
            <span class="text-label-lg font-semibold text-white">
              {{ loading ? 'Salvando...' : 'Salvar senha' }}
            </span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useAuth } from '~/composables/useAuth'

definePageMeta({ layout: false })

const { updatePassword } = useAuth()
const form    = reactive({ password: '', confirm: '' })
const errors  = reactive({ password: '', confirm: '', general: '' })
const loading = ref(false)
const done    = ref(false)

async function handleSubmit() {
  errors.password = ''
  errors.confirm  = ''
  errors.general  = ''

  if (form.password.length < 8) { errors.password = 'Mínimo 8 caracteres.'; return }
  if (form.password !== form.confirm) { errors.confirm = 'As senhas não coincidem.'; return }

  loading.value = true
  try {
    await updatePassword(form.password)
    done.value = true
  } catch {
    errors.general = 'Não foi possível atualizar a senha.'
  } finally {
    loading.value = false
  }
}
</script>
