<template>
  <div class="absolute inset-0 overflow-hidden bg-[#f0f4ff]" aria-hidden="true">

    <!-- Gradiente de fundo suave -->
    <div class="absolute inset-0" style="background: radial-gradient(ellipse at 30% 50%, #e0e7ff 0%, #f0f4ff 60%, #f8fafc 100%)" />

    <!-- Mockup do board kanban — centralizado e levemente inclinado -->
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
      <div
        class="w-[520px] opacity-90"
        style="transform: perspective(900px) rotateY(-8deg) rotateX(3deg) scale(0.88); transform-origin: center center;"
      >

        <!-- Janela do app -->
        <div class="bg-white rounded-2xl shadow-2xl overflow-hidden border border-neutral-200/80">

          <!-- Barra de título da janela -->
          <div class="flex items-center gap-2 px-4 py-3 bg-neutral-50 border-b border-neutral-200">
            <div class="w-3 h-3 rounded-full bg-red-400" />
            <div class="w-3 h-3 rounded-full bg-yellow-400" />
            <div class="w-3 h-3 rounded-full bg-green-400" />
            <div class="flex-1 mx-4 h-5 bg-neutral-200 rounded-full text-[10px] text-neutral-400 flex items-center px-3">
              qualitec.app/boards/sprint-42
            </div>
          </div>

          <!-- Header do board -->
          <div class="flex items-center justify-between px-5 py-3 border-b border-neutral-100">
            <div class="flex items-center gap-3">
              <div class="w-6 h-6 rounded-lg bg-indigo-500 flex items-center justify-center">
                <div class="w-3 h-3 grid grid-cols-2 gap-0.5">
                  <div class="bg-white rounded-sm" /><div class="bg-white rounded-sm" />
                  <div class="bg-white rounded-sm" /><div class="bg-white rounded-sm" />
                </div>
              </div>
              <span class="text-sm font-semibold text-neutral-800">Sprint 42 — Produto</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="flex -space-x-1.5">
                <div v-for="(c, i) in avatarColors" :key="i" class="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-white" :style="`background:${c}`">
                  {{ avatarInitials[i] }}
                </div>
              </div>
              <div class="w-16 h-5 bg-indigo-500 rounded-md" />
            </div>
          </div>

          <!-- Colunas kanban -->
          <div class="flex gap-3 p-4 bg-neutral-50/50 overflow-hidden">

            <!-- Coluna: A fazer -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-2.5">
                <div class="w-2 h-2 rounded-full bg-neutral-400" />
                <span class="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">A fazer</span>
                <span class="ml-auto text-[10px] text-neutral-400 bg-neutral-200 rounded-full px-1.5">3</span>
              </div>
              <div class="space-y-2">
                <KanbanCard title="Criar tela de onboarding" tag="Design" tag-color="#e0e7ff" tag-text="#4338ca" priority="alta" assignee="#6366f1" initials="ST" />
                <KanbanCard title="Revisar documentação API" tag="Dev" tag-color="#d1fae5" tag-text="#065f46" priority="media" assignee="#10b981" initials="JD" />
                <KanbanCard title="Testes de regressão" tag="QA" tag-color="#fef3c7" tag-text="#92400e" priority="baixa" assignee="#f59e0b" initials="MK" />
              </div>
            </div>

            <!-- Coluna: Em andamento -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-2.5">
                <div class="w-2 h-2 rounded-full bg-indigo-500" />
                <span class="text-[11px] font-semibold text-indigo-600 uppercase tracking-wide">Em andamento</span>
                <span class="ml-auto text-[10px] text-indigo-400 bg-indigo-100 rounded-full px-1.5">2</span>
              </div>
              <div class="space-y-2">
                <KanbanCard title="Dashboard de métricas" tag="Dev" tag-color="#e0e7ff" tag-text="#4338ca" priority="alta" assignee="#8b5cf6" initials="AL" :progress="65" />
                <KanbanCard title="Integração Supabase" tag="Backend" tag-color="#d1fae5" tag-text="#065f46" priority="alta" assignee="#6366f1" initials="RB" :progress="40" />
              </div>
            </div>

            <!-- Coluna: Concluído -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-2.5">
                <div class="w-2 h-2 rounded-full bg-emerald-500" />
                <span class="text-[11px] font-semibold text-emerald-600 uppercase tracking-wide">Concluído</span>
                <span class="ml-auto text-[10px] text-emerald-500 bg-emerald-100 rounded-full px-1.5">4</span>
              </div>
              <div class="space-y-2">
                <KanbanCard title="Setup do projeto" tag="Infra" tag-color="#d1fae5" tag-text="#065f46" priority="baixa" assignee="#10b981" initials="ST" :done="true" />
                <KanbanCard title="Autenticação JWT" tag="Backend" tag-color="#fce7f3" tag-text="#9d174d" priority="alta" assignee="#ec4899" initials="JD" :done="true" />
                <KanbanCard title="Design system base" tag="Design" tag-color="#e0e7ff" tag-text="#4338ca" priority="media" assignee="#6366f1" initials="MK" :done="true" />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- Reflexo/brilho sutil no topo -->
    <div class="absolute top-0 left-0 right-0 h-32 pointer-events-none" style="background: linear-gradient(to bottom, rgba(255,255,255,0.6), transparent)" />
    <!-- Reflexo/brilho sutil na base -->
    <div class="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" style="background: linear-gradient(to top, rgba(255,255,255,0.6), transparent)" />

  </div>
</template>

<script setup lang="ts">
const avatarColors   = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b']
const avatarInitials = ['ST', 'JD', 'MK', 'AL']
</script>
