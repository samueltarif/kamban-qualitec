<template>
  <div class="relative min-h-screen flex overflow-hidden bg-neutral-900">

    <!-- ===== COLUNA 1: VÍDEO + BRANDING (1/3) ===== -->
    <div class="hidden lg:flex lg:w-1/3 relative overflow-hidden">
      <video ref="videoDesktop" autoplay muted loop playsinline class="absolute inset-0 w-full h-full object-cover" aria-hidden="true">
        <source src="/video/Roteiro 1.mp4" type="video/mp4" />
      </video>
      <div class="absolute inset-0" style="background: linear-gradient(160deg, rgba(15,23,42,0.85) 0%, rgba(79,70,229,0.55) 100%);" />

      <!-- Botão mute -->
      <button
        @click="toggleMute"
        class="absolute bottom-5 right-5 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 transition-all"
        :aria-label="isMuted ? 'Ativar som' : 'Desativar som'"
      >
        <svg v-if="isMuted" class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
        </svg>
        <svg v-else class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.536 8.464a5 5 0 010 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
      </button>

      <div class="relative z-10 flex flex-col justify-between p-10 w-full">
        <!-- Logo -->
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center w-9 h-9 bg-white/15 backdrop-blur-sm rounded-xl border border-white/20">
            <img src="/favicon.ico" alt="Qualitec" class="w-5 h-5 object-contain" />
          </div>
          <span class="text-white font-semibold text-base tracking-tight">Qualitec</span>
        </div>

        <!-- Tagline -->
        <div>
          <h1 class="text-white font-bold leading-tight mb-3" style="font-size: 2rem; letter-spacing: -0.03em;">
            Organize seu time.<br />Entregue mais rápido.
          </h1>
          <p class="text-white/65 text-sm leading-relaxed">
            Gestão de tarefas em equipe com quadros kanban, prazos e colaboração em tempo real.
          </p>
        </div>

        <p class="text-white/35 text-xs">© {{ new Date().getFullYear() }} Qualitec</p>
      </div>
    </div>

    <!-- ===== COLUNA 2: FORMULÁRIO (1/3) ===== -->
    <div class="w-full lg:w-1/3 flex items-center justify-center relative bg-[#f8fafc]">
      <!-- Mobile: vídeo desfocado -->
      <div class="lg:hidden absolute inset-0 overflow-hidden">
        <video ref="videoMobile" autoplay muted loop playsinline class="absolute inset-0 w-full h-full object-cover scale-110 blur-sm" aria-hidden="true">
          <source src="/video/Roteiro 1.mp4" type="video/mp4" />
        </video>
        <div class="absolute inset-0" style="background: rgba(15,23,42,0.78);" />
        <button @click="toggleMute" class="absolute bottom-5 right-5 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20 transition-all" :aria-label="isMuted ? 'Ativar som' : 'Desativar som'">
          <svg v-if="isMuted" class="w-5 h-5 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
          <svg v-else class="w-5 h-5 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.536 8.464a5 5 0 010 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
        </button>
      </div>

      <!-- Card de login -->
      <div class="relative z-10 w-full max-w-xs px-6 py-10 lg:px-8">
        <!-- Logo mobile -->
        <div class="lg:hidden flex items-center gap-3 mb-8">
          <div class="flex items-center justify-center w-9 h-9 bg-white/20 rounded-xl border border-white/30">
            <img src="/favicon.ico" alt="Qualitec" class="w-5 h-5 object-contain" />
          </div>
          <span class="text-white font-semibold text-base">Qualitec</span>
        </div>
        <!-- Cabeçalho -->
        <div class="mb-7">
          <h2 class="font-bold mb-1 text-white lg:text-neutral-900" style="font-size: 1.6rem; letter-spacing: -0.02em;">
            Bem-vindo de volta
          </h2>
          <p class="text-sm text-white/70 lg:text-neutral-500">Entre com suas credenciais para continuar</p>
        </div>

        <form @submit.prevent="handleLogin" novalidate class="space-y-4">

          <div>
            <label for="email" class="text-sm font-medium text-white/90 lg:text-neutral-700 block mb-1.5">E-mail</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              autocomplete="email"
              placeholder="seu@email.com"
              class="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all bg-white/15 lg:bg-white border border-white/25 lg:border-neutral-200 text-white lg:text-neutral-900 placeholder:text-white/50 lg:placeholder:text-neutral-400 backdrop-blur-sm lg:backdrop-blur-none"
              :class="{ 'border-red-400': errors.email }"
            />
            <p v-if="errors.email" class="text-xs mt-1 text-red-300 lg:text-red-500">{{ errors.email }}</p>
          </div>

          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label for="password" class="text-sm font-medium text-white/90 lg:text-neutral-700">Senha</label>
              <NuxtLink to="/forgot-password" class="text-xs font-medium text-indigo-300 lg:text-indigo-600 hover:text-white lg:hover:text-indigo-700 transition-colors">
                Esqueceu a senha?
              </NuxtLink>
            </div>
            <input
              id="password"
              v-model="form.password"
              type="password"
              autocomplete="current-password"
              placeholder="••••••••"
              class="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all bg-white/15 lg:bg-white border border-white/25 lg:border-neutral-200 text-white lg:text-neutral-900 placeholder:text-white/50 lg:placeholder:text-neutral-400 backdrop-blur-sm lg:backdrop-blur-none"
              :class="{ 'border-red-400': errors.password }"
            />
            <p v-if="errors.password" class="text-xs mt-1 text-red-300 lg:text-red-500">{{ errors.password }}</p>
          </div>

          <div v-if="errors.general" class="bg-red-500/20 lg:bg-red-50 border border-red-400/40 lg:border-red-200 rounded-xl px-4 py-3">
            <p class="text-sm text-red-200 lg:text-red-700">{{ errors.general }}</p>
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-3 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2"
          >
            {{ isLoading ? 'Entrando...' : 'Entrar' }}
          </button>

        </form>
      </div>
    </div>

    <!-- ===== COLUNA 3: MOCKUP KANBAN (1/3) ===== -->
    <div class="hidden lg:flex lg:w-1/3 relative overflow-hidden items-center justify-center bg-[#f8fafc]">

      <!-- Decoração de fundo sutil -->
      <div class="absolute inset-0 opacity-40" style="background-image: radial-gradient(circle at 70% 30%, #e0e7ff 0%, transparent 55%), radial-gradient(circle at 30% 70%, #d1fae5 0%, transparent 55%)" />

      <!-- Mockup do board -->
      <div class="relative z-10 w-full px-6">
        <div
          class="bg-white rounded-2xl shadow-2xl overflow-hidden border border-neutral-200/60"
          style="transform: perspective(800px) rotateY(-6deg) rotateX(2deg);"
        >
          <!-- Barra título -->
          <div class="flex items-center gap-1.5 px-3 py-2.5 bg-neutral-50 border-b border-neutral-100">
            <div class="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div class="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <div class="w-2.5 h-2.5 rounded-full bg-green-400" />
            <span class="ml-2 text-[10px] text-neutral-400 font-medium">Qualitec — Operações</span>
          </div>

          <!-- Colunas -->
          <div class="flex gap-2 p-3 bg-neutral-50/60">

            <!-- A fazer -->
            <div class="flex-1">
              <div class="flex items-center gap-1.5 mb-2">
                <div class="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                <span class="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">A fazer</span>
                <span class="ml-auto text-[8px] bg-neutral-200 text-neutral-500 rounded-full px-1">3</span>
              </div>
              <div class="space-y-1.5">
                <MiniCard title="Cotação cliente #4821" tag="Comercial" color="#6366f1" />
                <MiniCard title="Emitir NF-e lote 09" tag="Adm" color="#f59e0b" />
                <MiniCard title="Separar pedido #302" tag="Estoque" color="#10b981" />
              </div>
            </div>

            <!-- Em andamento -->
            <div class="flex-1">
              <div class="flex items-center gap-1.5 mb-2">
                <div class="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span class="text-[9px] font-bold text-indigo-500 uppercase tracking-wider">Fazendo</span>
                <span class="ml-auto text-[8px] bg-indigo-100 text-indigo-500 rounded-full px-1">3</span>
              </div>
              <div class="space-y-1.5">
                <MiniCard title="Subir pedido #4822" tag="Comercial" color="#8b5cf6" :progress="70" />
                <MiniCard title="Faturamento abril" tag="Adm" color="#f59e0b" :progress="45" />
                <MiniCard title="Conferir expedição" tag="Expedição" color="#06b6d4" :progress="80" />
              </div>
            </div>

            <!-- Concluído -->
            <div class="flex-1">
              <div class="flex items-center gap-1.5 mb-2">
                <div class="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span class="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Pronto</span>
                <span class="ml-auto text-[8px] bg-emerald-100 text-emerald-500 rounded-full px-1">4</span>
              </div>
              <div class="space-y-1.5">
                <MiniCard title="Cotação #4819" tag="Comercial" color="#6366f1" :done="true" />
                <MiniCard title="NF-e lote 08" tag="Adm" color="#f59e0b" :done="true" />
                <MiniCard title="Inventário setor B" tag="Estoque" color="#10b981" :done="true" />
                <MiniCard title="Ordem produção #77" tag="Produção" color="#ec4899" :done="true" />
              </div>
            </div>

          </div>
        </div>

        <!-- Label abaixo do mockup -->
        <p class="text-center text-xs text-neutral-400 mt-4 font-medium">Visualize o progresso do seu time em tempo real</p>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  layout: false,
  middleware: ['redirect-if-auth'],
})

const { login, isLoading } = useAuth()

const form   = reactive({ email: '', password: '' })
const errors = reactive({ email: '', password: '', general: '' })

const videoDesktop = ref<HTMLVideoElement | null>(null)
const videoMobile  = ref<HTMLVideoElement | null>(null)
const isMuted = ref(true)

function toggleMute() {
  isMuted.value = !isMuted.value
  if (videoDesktop.value) videoDesktop.value.muted = isMuted.value
  if (videoMobile.value)  videoMobile.value.muted  = isMuted.value
}

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
