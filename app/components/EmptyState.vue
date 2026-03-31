<template>
  <div class="flex flex-col items-center justify-center gap-3 py-12 text-center">
    <!-- Icon slot ou padrão -->
    <div class="w-14 h-14 bg-neutral-100 rounded-2xl flex items-center justify-center">
      <slot name="icon">
        <svg class="w-7 h-7 text-neutral-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </slot>
    </div>

    <div>
      <p class="text-body-sm text-subtle font-medium">{{ title }}</p>
      <p v-if="description" class="text-micro text-muted mt-0.5">{{ description }}</p>
    </div>

    <slot name="action" />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  description?: string
}>(), {
  title: 'Nenhum item encontrado',
})
</script>
