<template>
  <div
    :class="[
      'bg-white rounded-lg p-2 border text-left',
      done ? 'border-emerald-100' : 'border-neutral-200/80'
    ]"
    style="box-shadow: 0 1px 3px rgba(0,0,0,0.06)"
  >
    <!-- Barra de acento + tag -->
    <div class="flex items-center gap-1.5 mb-1.5">
      <div class="w-1 h-3 rounded-full" :style="`background:${color}`" />
      <span class="text-[8px] font-semibold px-1.5 py-0.5 rounded-full" :style="`background:${color}18; color:${color}`">
        {{ tag }}
      </span>
      <svg v-if="done" class="ml-auto w-2.5 h-2.5 text-emerald-500" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>

    <!-- Título -->
    <p :class="['text-[10px] font-medium leading-tight', done ? 'line-through text-neutral-400' : 'text-neutral-700']">
      {{ title }}
    </p>

    <!-- Progresso -->
    <div v-if="progress !== undefined" class="mt-1.5">
      <div class="h-0.5 bg-neutral-100 rounded-full overflow-hidden">
        <div class="h-full rounded-full transition-all" :style="`width:${progress}%; background:${color}`" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  tag: string
  color: string
  progress?: number
  done?: boolean
}>()
</script>
