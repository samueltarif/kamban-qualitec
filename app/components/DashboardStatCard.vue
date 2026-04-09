<template>
  <div
    class="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow duration-[200ms]"
  >
    <div
      class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
      :class="bgClass"
    >
      <span class="text-xl" aria-hidden="true">{{ icon }}</span>
    </div>
    <div>
      <p class="text-2xl font-bold" :class="colorClass">{{ value }}</p>
      <p class="text-label-sm text-subtle">{{ label }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  icon: string
  bgClass: string
  colorClass: string
}>()
</script>
