<template>
  <div class="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
    <div class="w-full max-w-sm">

      <div class="text-center mb-10">
        <div class="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-2xl shadow-md mb-5">
          <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <h1 class="text-title-md text-strong mb-1">Recuperar senha</h1>
        <p class="text-body-sm text-muted">Enviaremos um link para seu e-mail</p>
      </div>

      <div class="bg-white rounded-2xl shadow-lg p-8">
        <div v-if="sent" class="text-center py-4">
          <div class="w-12 h-12 bg-success-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-success-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p class="text-body-sm text-strong font-medium mb-1">E-mail enviado</p>
          <p class="text-micro text-muted mb-6">Verifique sua caixa de entrada e siga as instruções.</p>
          <NuxtLink to="/login" class="text-label-sm font-medium" style="color: var(--color-primary-500);">
            Voltar ao login
          </NuxtLink>
        </div>

        <form v-else @submit.prevent="handleSubmit" novalidate>
          <div class="mb-6">
            <label for="email" class="text-label-md text-default block mb-1.5">E-mail</label>
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              placeholder="seu@email.com"
              class="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-body-sm text-strong placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all duration-[150ms]"
              :class="{ 'border-error-400': error }"
            />
            <p v-if="error" class="text-micro mt-1.5" style="color: var(--color-error-500);">{{ error }}</p>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-primary text-white font-semibold py-3 rounded-xl shadow-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-[150ms]"
          >
            <span class="text-label-lg font-semibold text-white">
              {{ loading ? 'Enviando...' : 'Enviar link' }}
            </span>
          </button>

          <div class="text-center mt-5">
            <NuxtLink to="/login" class="text-label-sm text-subtle hover:text-default transition-colors duration-[150ms]">
              Voltar ao login
            </NuxtLink>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '~/composables/useAuth'

definePageMeta({ layout: false, middleware: ['redirect-if-auth'] })

const { sendPasswordReset } = useAuth()
const email   = ref('')
const error   = ref('')
const loading = ref(false)
const sent    = ref(false)

async function handleSubmit() {
  error.value = ''
  if (!email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    error.value = 'Informe um e-mail válido.'
    return
  }
  loading.value = true
  try {
    await sendPasswordReset(email.value)
    sent.value = true
  } catch {
    error.value = 'Não foi possível enviar o e-mail. Tente novamente.'
  } finally {
    loading.value = false
  }
}
</script>
