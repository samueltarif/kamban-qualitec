<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        role="dialog"
        :aria-modal="true"
        :aria-labelledby="titleId"
        @keydown.esc="close"
      >
        <!-- Overlay -->
        <div
          class="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm"
          aria-hidden="true"
          @click="closeOnBackdrop && close()"
        />

        <!-- Panel -->
        <div
          ref="panelRef"
          tabindex="-1"
          :class="[
            'relative z-10 w-full bg-white shadow-xl flex flex-col',
            'rounded-t-2xl sm:rounded-2xl',
            sizeClass,
            'max-h-[90vh] sm:max-h-[85vh]',
            'focus:outline-none',
          ]"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-6 pt-5 pb-4 border-b border-neutral-100 shrink-0">
            <h2 :id="titleId" class="text-title-sm text-strong">
              <slot name="title">{{ title }}</slot>
            </h2>
            <button
              @click="close"
              class="flex items-center justify-center w-8 h-8 rounded-xl text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors duration-[150ms]"
              aria-label="Fechar"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto px-6 py-5">
            <slot />
          </div>

          <!-- Footer -->
          <div
            v-if="$slots.footer"
            class="px-6 py-4 border-t border-neutral-100 shrink-0 flex items-center justify-end gap-3"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closeOnBackdrop?: boolean
}>(), {
  size: 'md',
  closeOnBackdrop: true,
})

const emit = defineEmits<{ 'update:modelValue': [v: boolean] }>()

const panelRef = ref<HTMLElement | null>(null)
const titleId  = `modal-title-${Math.random().toString(36).slice(2, 7)}`

const sizeClass = computed(() => ({
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-2xl',
}[props.size]))

function close() {
  emit('update:modelValue', false)
}

// Focus trap — foca o painel ao abrir
watch(() => props.modelValue, async (val) => {
  if (val) {
    await nextTick()
    panelRef.value?.focus()
  }
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1), opacity 200ms;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .relative {
  transform: translateY(1rem);
  opacity: 0;
}
.modal-leave-to .relative {
  transform: translateY(1rem);
  opacity: 0;
}
</style>
