<template>
  <div
    class="bg-white border border-neutral-200 rounded-xl p-6 hover:shadow-lg hover:border-primary-300 transition-all group relative cursor-pointer"
    @click="$emit('click')"
  >
    <!-- Icon & Badge & Menu -->
    <div class="flex items-start justify-between mb-4">
      <div 
        class="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 transition-colors"
      >
        <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      </div>
      
      <div class="flex items-center gap-2">
        <span
          v-if="workspace.visibility === 'private'"
          class="px-2 py-1 bg-neutral-100 text-neutral-600 text-micro font-medium rounded-md flex items-center gap-1"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Privado
        </span>

        <!-- Menu Button -->
        <button
          @click.stop="showMenu = !showMenu"
          class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
          aria-label="Menu"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>

        <!-- Dropdown Menu -->
        <Transition name="fade">
          <div
            v-if="showMenu"
            v-click-outside="() => showMenu = false"
            class="absolute right-6 top-16 z-10 w-48 bg-white rounded-xl shadow-lg border border-neutral-200 py-1"
          >
            <button
              @click.stop="handleEdit"
              class="w-full px-4 py-2 text-left text-label-md text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </button>
            <button
              @click.stop="handleDelete"
              class="w-full px-4 py-2 text-left text-label-md text-danger-600 hover:bg-danger-50 flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Excluir
            </button>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Content -->
    <div class="mb-4">
      <h3 class="text-heading-sm font-semibold text-neutral-900 mb-1 group-hover:text-primary-600 transition-colors">
        {{ workspace.name }}
      </h3>
      <p class="text-label-sm text-muted">
        /{{ workspace.slug }}
      </p>
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-between text-label-sm text-muted">
      <span class="flex items-center gap-1">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {{ formatDate(workspace.created_at) }}
      </span>
      
      <svg class="w-5 h-5 text-neutral-400 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Tables } from '#shared/types/database'

defineProps<{
  workspace: Tables<'workspaces'>
}>()

const emit = defineEmits<{
  click: []
  edit: []
  delete: []
}>()

const showMenu = ref(false)

function handleEdit() {
  showMenu.value = false
  emit('edit')
}

function handleDelete() {
  showMenu.value = false
  emit('delete')
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: 'short',
    year: 'numeric'
  })
}

// Directive para fechar menu ao clicar fora
interface ClickOutsideElement extends HTMLElement {
  clickOutsideEvent?: (event: Event) => void
}

const vClickOutside = {
  mounted(el: ClickOutsideElement, binding: any) {
    el.clickOutsideEvent = (event: Event) => {
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value()
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el: ClickOutsideElement) {
    if (el.clickOutsideEvent) {
      document.removeEventListener('click', el.clickOutsideEvent)
    }
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 150ms ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
