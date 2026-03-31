<template>
  <div class="relative min-h-screen flex overflow-hidden bg-neutral-900">

    <!-- ===================== LADO ESQUERDO — VÍDEO ===================== -->
    <div class="hidden lg:flex lg:w-1/2 relative overflow-hidden">

      <!-- Vídeo de fundo -->
      <video
        autoplay
        muted
        loop
        playsinline
        class="absolute inset-0 w-full h-full object-cover"
        aria-hidden="true"
      >
        <source src="/video/Roteiro 1.mp4" type="video/mp4" />
      </video>

      <!-- Overlay com gradiente nas cores da marca -->
      <div
        class="absolute inset-0"
        style="background: linear-gradient(135deg, rgba(28,50,92,0.82) 0%, rgba(122,102,82,0.65) 100%);"
      />

      <!-- Conteúdo sobre o vídeo -->
      <div class="relative z-10 flex flex-col justify-between p-12 w-full">

        <!-- Logo -->
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center w-10 h-10 bg-white/15 backdrop-blur-sm rounded-xl border border-white/20">
            <img src="/favicon.ico" alt="Qualitec" class="w-6 h-6 object-contain" />
          </div>
          <span class="text-white font-semibold text-lg tracking-tight">Qualitec</span>
        </div>

        <!-- Tagline central -->
        <div>
          <h1 class="text-white font-bold leading-tight mb-4" style="font-size: 2.5rem; letter-spacing: -0.03em;">
            Organize seu time.<br />Entregue mais rápido.
          </h1>
          <p class="text-white/70 text-base leading-relaxed max-w-sm">
            Gestão de tarefas em equipe com quadros kanban, prazos e colaboração em tempo real.
          </p>
        </div>

        <!-- Rodapé do lado esquerdo -->
        <p class="text-white/40 text-xs">
          © {{ new Date().getFullYear() }} Qualitec · Todos os direitos reservados
        </p>
      </div>
    </div>

    <!-- ===================== LADO DIREITO — FORMULÁRIO ===================== -->
    <div class="w-full lg:w-1/2 flex items-center justify-center relative bg-white">

      <!-- Vídeo como fundo no mobile (desfocado) -->
      <div class="lg:hidden absolute inset-0 overflow-hidden">
        <video
          autoplay
          muted
          loop
          playsinline
          class="absolute inset-0 w-full h-full object-cover scale-110 blur-sm"
          aria-hidden="true"
        >
          <source src="/video/Roteiro 1.mp4" type="video/mp4" />
        </video>
        <div class="absolute inset-0" style="background: rgba(28,50,92,0.75);" />
      </div>

      <!-- Card de login -->
      <div class="relative z-10 w-full max-w-sm px-6 py-10 lg:px-10">

        <!-- Logo mobile -->
        <div class="lg:hidden flex items-center gap-3 mb-10">
          <div class="flex items-center justify-center w-9 h-9 bg-white/15 backdrop-blur-sm rounded-xl border border-white/20">
            <img src="/favicon.ico" alt="Qualitec" class="w-5 h-5 object-contain" />
          </div>
          <span class="text-white font-semibold text-base">Qualitec</span>
        </div>

        <!-- Cabeçalho do form -->
        <div class="mb-8">
          <h2
            class="font-bold mb-1"
            style="font-size: 1.75rem; letter-spacing: -0.02em; color: var(--color-neutral-900);"
          >
            Bem-vindo de volta
          </h2>
          <p class="text-body-sm text-subtle">Entre com suas credenciais para continuar</p>
        </div>

        <form @submit.prevent="handleLogin" novalidate class="space-y-5">

          <!-- Email -->
          <div>
            <label for="email" class="text-label-md text-default block mb-1.5">E-mail</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              autocomplete="email"
              placeholder="seu@email.com"
              class="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-body-sm text-strong placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all duration-[150ms]"
              :class="{ 'border-error-400 focus:ring-error-300': errors.email }"
            />
            <p v-if="errors.email" class="text-micro mt-1.5" style="color: var(--color-error-500);">{{ errors.email }}</p>
          </div>

          <!-- Senha -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label for="password" class="text-label-md text-default">Senha</label>
              <NuxtLink to="/forgot-password" class="text-label-sm transition-colors duration-[150ms]" style="color: var(--color-primary-500);">
                Esqueceu a senha?
              </NuxtLink>
            </div>
            <input
              id="password"
              v-model="form.password"
              type="password"
              autocomplete="current-password"
              placeholder="••••••••"
              class="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-body-sm text-strong placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all duration-[150ms]"
              :class="{ 'border-error-400 focus:ring-error-300': errors.password }"
            />
            <p v-if="errors.password" class="text-micro mt-1.5" style="color: var(--color-error-500);">{{ errors.password }}</p>
          </div>

          <!-- Erro geral -->
          <div v-if="errors.general" class="bg-error-50 border border-error-200 rounded-xl px-4 py-3">
            <p class="text-body-sm" style="color: var(--color-error-700);">{{ errors.general }}</p>
          </div>

          <!-- Botão -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-3.5 rounded-xl font-semibold text-white shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-[150ms]"
            style="background: var(--color-primary-500);"
          >
            <span class="text-label-lg font-semibold text-white">
              {{ isLoading ? 'Entrando...' : 'Entrar' }}
            </span>
          </button>

        </form>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  layout: false,
  middleware: ['redirect-if-auth'],
})

const { login, isLoading } = useAuth()

const form   = reactive({ email: '', password: '' })
const errors = reactive({ email: '', password: '', general: '' })

function validate(): boolean {
  errors.email = ''
  errors.password = ''
  errors.general = ''
  if (!form.email) { errors.email = 'Informe seu e-mail.'; return false }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { errors.email = 'E-mail inválido.'; return false }
  if (!form.password) { errors.password = 'Informe sua senha.'; return false }
  if (form.password.length < 6) { errors.password = 'Senha deve ter ao menos 6 caracteres.'; return false }
  return true
}

async function handleLogin() {
  if (!validate()) return
  try {
    await login(form.email, form.password)
    await navigateTo('/')
  } catch {
    errors.general = 'E-mail ou senha incorretos.'
  }
}
</script>
