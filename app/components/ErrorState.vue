<template>
  <div class="flex flex-col items-center justify-center gap-3 py-12 text-center">
    <div class="w-14 h-14 bg-error-50 rounded-2xl flex items-center justify-center">
      <svg class="w-7 h-7 text-error-500" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    </div>

    <div>
      <p class="text-body-sm text-strong font-medium">{{ title }}</p>
      <p v-if="description" class="text-micro text-muted mt-0.5">{{ description }}</p>
    </div>

    <button
      v-if="retryLabel"
      @click="$emit('retry')"
      class="inline-flex items-center gap-1.5 text-label-sm font-medium transition-colors duration-[150ms]"
      style="color: var(--color-primary-500);"
    >
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      {{ retryLabel }}
    </button>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  description?: string
  retryLabel?: string
}>(), {
  title: 'Algo deu errado',
  description: 'Tente novamente em alguns instantes.',
  retryLabel: 'Tentar novamente',
})

defineEmits<{ retry: [] }>()
</script>
