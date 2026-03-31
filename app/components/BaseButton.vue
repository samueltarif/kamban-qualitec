<template>
  <component
    :is="tag"
    v-bind="attrs"
    :disabled="disabled || loading"
    :class="classes"
    @click="$emit('click', $event)"
  >
    <!-- Loading spinner -->
    <svg
      v-if="loading"
      class="animate-spin shrink-0"
      :class="iconSize"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>

    <!-- Icon left -->
    <slot v-else name="icon-left" />

    <!-- Label -->
    <span v-if="$slots.default" class="truncate"><slot /></span>

    <!-- Icon right -->
    <slot name="icon-right" />
  </component>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'

const props = withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  tag?: string
  block?: boolean
}>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  tag: 'button',
  block: false,
})

defineEmits<{ click: [e: MouseEvent] }>()

const attrs = useAttrs()

const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl border transition-all duration-[150ms] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 select-none'

const variantMap: Record<string, string> = {
  primary:   'bg-primary text-white border-transparent hover:bg-primary-600 active:bg-primary-700 focus-visible:ring-primary-400 shadow-sm hover:shadow-md',
  secondary: 'bg-secondary text-white border-transparent hover:bg-secondary-600 active:bg-secondary-700 focus-visible:ring-secondary-400 shadow-sm',
  ghost:     'bg-transparent text-neutral-700 border-transparent hover:bg-neutral-100 active:bg-neutral-200 focus-visible:ring-neutral-400',
  outline:   'bg-transparent text-primary border-primary hover:bg-primary-50 active:bg-primary-100 focus-visible:ring-primary-400',
  danger:    'bg-error-500 text-white border-transparent hover:bg-error-600 active:bg-error-700 focus-visible:ring-error-400 shadow-sm',
}

const sizeMap: Record<string, string> = {
  sm: 'h-8  px-3 text-xs',
  md: 'h-10 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
}

const iconSize = computed(() => ({ sm: 'w-3 h-3', md: 'w-4 h-4', lg: 'w-5 h-5' }[props.size]))

const classes = computed(() => [
  base,
  variantMap[props.variant],
  sizeMap[props.size],
  props.block ? 'w-full' : '',
  (props.disabled || props.loading) ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer',
])
</script>
