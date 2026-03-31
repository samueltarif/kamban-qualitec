<template>
  <div :class="['flex flex-col gap-1', block ? 'w-full' : '']">

    <!-- Label -->
    <label
      v-if="label"
      :for="inputId"
      class="text-label-md text-default"
    >
      {{ label }}
      <span v-if="required" class="text-error-500 ml-0.5" aria-hidden="true">*</span>
    </label>

    <!-- Input wrapper -->
    <div class="relative flex items-center">
      <!-- Icon left -->
      <span
        v-if="$slots['icon-left']"
        class="absolute left-3 text-neutral-400 pointer-events-none"
        aria-hidden="true"
      >
        <slot name="icon-left" />
      </span>

      <input
        :id="inputId"
        v-bind="$attrs"
        :value="modelValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :aria-describedby="hint || error ? descId : undefined"
        :aria-invalid="!!error"
        :class="inputClasses"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      />

      <!-- Icon right / clear -->
      <span
        v-if="$slots['icon-right']"
        class="absolute right-3 text-neutral-400"
        aria-hidden="true"
      >
        <slot name="icon-right" />
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

const props = withDefaults(defineProps<{
  modelValue?: string
  label?: string
  placeholder?: string
  hint?: string
  error?: string
  type?: string
  disabled?: boolean
  required?: boolean
  block?: boolean
  id?: string
}>(), {
  type: 'text',
  disabled: false,
  required: false,
  block: true,
})

defineEmits<{
  'update:modelValue': [v: string]
  blur: [e: FocusEvent]
  focus: [e: FocusEvent]
}>()

defineOptions({ inheritAttrs: false })

const inputId = computed(() => props.id ?? `input-${Math.random().toString(36).slice(2, 7)}`)
const descId  = computed(() => `${inputId.value}-desc`)

const hasIconLeft  = computed(() => false) // slot detection via CSS padding
const inputClasses = computed(() => [
  'w-full bg-neutral-50 border rounded-lg text-body-sm text-strong placeholder:text-muted',
  'px-4 py-2.5 transition-all duration-[150ms]',
  'focus:outline-none focus:ring-2 focus:border-transparent',
  props.error
    ? 'border-error-400 focus:ring-error-300'
    : 'border-neutral-200 focus:ring-primary-400',
  props.disabled ? 'opacity-50 cursor-not-allowed bg-neutral-100' : '',
])
</script>
