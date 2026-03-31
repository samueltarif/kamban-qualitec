<template>
  <div
    class="flex flex-col items-center justify-center gap-3 py-12 text-center"
    role="status"
    :aria-label="label"
  >
    <svg
      class="animate-spin text-primary-400"
      :class="spinnerSize"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle class="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" />
      <path class="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
    <p class="text-body-sm text-subtle">{{ label }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  label?: string
  size?: 'sm' | 'md' | 'lg'
}>(), {
  label: 'Carregando...',
  size: 'md',
})

const spinnerSize = computed(() => ({
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
}[props.size]))
</script>
