<template>
  <div
    :class="[
      'bg-white rounded-xl p-3 border shadow-sm transition-all',
      done ? 'border-emerald-100 opacity-70' : 'border-neutral-200/80'
    ]"
  >
    <!-- Tag + prioridade -->
    <div class="flex items-center justify-between mb-2">
      <span
        class="text-[9px] font-semibold px-2 py-0.5 rounded-full"
        :style="`background:${tagColor}; color:${tagText}`"
      >{{ tag }}</span>
      <div class="flex items-center gap-1">
        <div
          class="w-1.5 h-1.5 rounded-full"
          :class="{
            'bg-red-400': priority === 'alta',
            'bg-yellow-400': priority === 'media',
            'bg-neutral-300': priority === 'baixa'
          }"
        />
        <span class="text-[9px] text-neutral-400 capitalize">{{ priority }}</span>
      </div>
    </div>

    <!-- Título -->
    <p
      :class="[
        'text-[11px] font-medium leading-tight mb-2',
        done ? 'line-through text-neutral-400' : 'text-neutral-700'
      ]"
    >{{ title }}</p>

    <!-- Barra de progresso -->
    <div v-if="progress !== undefined" class="mb-2">
      <div class="flex items-center justify-between mb-1">
        <span class="text-[9px] text-neutral-400">Progresso</span>
        <span class="text-[9px] font-medium text-indigo-500">{{ progress }}%</span>
      </div>
      <div class="h-1 bg-neutral-100 rounded-full overflow-hidden">
        <div class="h-full bg-indigo-400 rounded-full transition-all" :style="`width:${progress}%`" />
      </div>
    </div>

    <!-- Rodapé: avatar + check se done -->
    <div class="flex items-center justify-between">
      <div
        class="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
        :style="`background:${assignee}`"
      >{{ initials }}</div>

      <div v-if="done" class="flex items-center gap-1">
        <svg class="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <span class="text-[9px] text-emerald-500 font-medium">Concluído</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  tag: string
  tagColor: string
  tagText: string
  priority: 'alta' | 'media' | 'baixa'
  assignee: string
  initials: string
  progress?: number
  done?: boolean
}>()
</script>
