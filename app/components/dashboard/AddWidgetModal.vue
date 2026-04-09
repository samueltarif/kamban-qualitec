<template>
  <BaseModal
    v-model="isOpen"
    title="Adicionar ferramenta"
    max-width="600px"
  >
    <div class="space-y-4">
      <!-- Lista de widgets disponíveis -->
      <div class="grid grid-cols-1 gap-3">
        <button
          v-for="widgetType in availableWidgets"
          :key="widgetType.id"
          type="button"
          class="flex items-center gap-4 p-4 rounded-lg border border-neutral-200 hover:border-primary-500 hover:bg-primary-50 transition-all text-left group"
          @click="selectWidget(widgetType)"
        >
          <!-- Ícone -->
          <div
            class="w-14 h-14 rounded-lg flex items-center justify-center shrink-0 transition-colors"
            :class="widgetType.iconBg"
          >
            <component :is="widgetType.icon" class="w-7 h-7 text-white" />
          </div>

          <!-- Conteúdo -->
          <div class="flex-1 min-w-0">
            <h3 class="text-sm font-semibold text-neutral-900 mb-1">
              {{ widgetType.title }}
            </h3>
            <p class="text-xs text-neutral-600 line-clamp-2">
              {{ widgetType.description }}
            </p>
          </div>

          <!-- Seta -->
          <svg class="w-5 h-5 text-neutral-400 group-hover:text-primary-600 transition-colors shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      <!-- Link para mais widgets -->
      <div class="text-center pt-4 border-t border-neutral-200">
        <button
          type="button"
          class="text-sm text-primary-600 hover:text-primary-700 font-medium"
          @click="handleMoreWidgets"
        >
          Mais widgets
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, h } from '#imports'
import BaseModal from '~/components/BaseModal.vue'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'select': [widgetType: string]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Ícones SVG como componentes
const ChartIcon = () => h('svg', {
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2',
  viewBox: '0 0 24 24'
}, [
  h('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    d: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z'
  })
])

const NumbersIcon = () => h('svg', {
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2',
  viewBox: '0 0 24 24'
}, [
  h('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    d: 'M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z'
  })
])

const BatteryIcon = () => h('svg', {
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2',
  viewBox: '0 0 24 24'
}, [
  h('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    d: 'M21 10.5h.375c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125H21M3.75 18h15A2.25 2.25 0 0021 15.75v-7.5A2.25 2.25 0 0018.75 6h-15A2.25 2.25 0 001.5 8.25v7.5A2.25 2.25 0 003.75 18z'
  })
])

const GanttIcon = () => h('svg', {
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2',
  viewBox: '0 0 24 24'
}, [
  h('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    d: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z'
  })
])

const FilesIcon = () => h('svg', {
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2',
  viewBox: '0 0 24 24'
}, [
  h('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    d: 'M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z'
  })
])

const StatusIcon = () => h('svg', {
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2',
  viewBox: '0 0 24 24'
}, [
  h('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    d: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  })
])

// Tipos de widgets disponíveis
const availableWidgets = [
  {
    id: 'assignee-chart',
    title: 'Gráfico',
    description: 'Crie um widget de gráfico para exibir visualmente seus dados',
    icon: ChartIcon,
    iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
    type: 'assignee'
  },
  {
    id: 'numbers',
    title: 'Números',
    description: 'Obtenha uma visão rápida de todas as suas métricas importantes',
    icon: NumbersIcon,
    iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
    type: 'numbers'
  },
  {
    id: 'battery',
    title: 'Bateria',
    description: 'Confira seu progresso',
    icon: BatteryIcon,
    iconBg: 'bg-gradient-to-br from-green-500 to-green-600',
    type: 'progress'
  },
  {
    id: 'gantt',
    title: 'Gantt',
    description: 'Planeje, rastreie e apresente visualmente seu cronograma',
    icon: GanttIcon,
    iconBg: 'bg-gradient-to-br from-orange-500 to-orange-600',
    type: 'gantt'
  },
  {
    id: 'files',
    title: 'Galeria de arquivos',
    description: 'Gerencie e colabore em seus arquivos com facilidade',
    icon: FilesIcon,
    iconBg: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
    type: 'files'
  },
  {
    id: 'status',
    title: 'Status',
    description: 'Visualize tarefas agrupadas por status',
    icon: StatusIcon,
    iconBg: 'bg-gradient-to-br from-pink-500 to-pink-600',
    type: 'status'
  }
]

function selectWidget(widgetType: any) {
  emit('select', widgetType.type)
  isOpen.value = false
}

function handleMoreWidgets() {
  console.log('[AddWidgetModal] More widgets clicked')
  // Futuramente pode abrir uma galeria completa
}
</script>
