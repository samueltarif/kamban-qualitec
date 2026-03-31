<template>
  <div :class="['flex flex-col gap-1', block ? 'w-full' : '']">

    <!-- Label -->
    <label
      v-if="label"
      :for="selectId"
      class="text-label-md text-default"
    >
      {{ label }}
      <span v-if="required" class="text-error-500 ml-0.5" aria-hidden="true">*</span>
    </label>

    <!-- Select wrapper -->
    <div class="relative">
      <select
        :id="selectId"
        v-bind="$attrs"
        :value="modelValue"
        :disabled="disabled"
        :required="required"
        :aria-describedby="hint || error ? descId : undefined"
        :aria-invalid="!!error"
        :class="selectClasses"
        @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
        @blur="$emit('blur', $event)"
      >
        <option v-if="placeholder" value="" disabled :selected="!modelValue">
          {{ placeholder }}
        </option>
        <option
          v-for="opt in options"
          :key="opt.value"
          :value="opt.value"
          :disabled="opt.disabled"
        >
          {{ opt.label }}
        </option>
      </select>

      <!-- Chevron -->
      <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" aria-hidden="true">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </span>
    </div>

    <!-- Hint / Error -->
    <p
      v-if="error || hint"
      :id="descId"
      class="text-micro"
      :class="error ? 'text-error-600' : 'text-muted'"
    >
      {{ error || hint }}
    </p>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
}

const props = withDefaults(defineProps<{
  modelValue?: string | number
  options: SelectOption[]
  label?: string
  placeholder?: string
  hint?: string
  error?: string
  disabled?: boolean
  required?: boolean
  block?: boolean
  id?: string
}>(), {
  disabled: false,
  required: false,
  block: true,
})

defineEmits<{
  'update:modelValue': [v: string]
  blur: [e: FocusEvent]
}>()

defineOptions({ inheritAttrs: false })

const selectId = computed(() => props.id ?? `select-${Math.random().toString(36).slice(2, 7)}`)
const descId   = computed(() => `${selectId.value}-desc`)

const selectClasses = computed(() => [
  'w-full appearance-none bg-neutral-50 border rounded-lg text-body-sm text-strong pr-9',
  'px-4 py-2.5 transition-all duration-[150ms]',
  'focus:outline-none focus:ring-2 focus:border-transparent',
  props.error
    ? 'border-error-400 focus:ring-error-300'
    : 'border-neutral-200 focus:ring-primary-400',
  props.disabled ? 'opacity-50 cursor-not-allowed bg-neutral-100' : 'cursor-pointer',
  !props.modelValue ? 'text-muted' : '',
])
</script>
