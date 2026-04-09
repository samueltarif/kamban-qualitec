<template>
  <div class="bg-white border-b border-neutral-200">
    <!-- Container principal -->
    <div class="px-4 py-4 sm:px-6 lg:px-8">
      
      <!-- Título + Favoritar -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3 min-w-0">
          <h1 class="text-xl sm:text-2xl font-semibold text-neutral-800 truncate">
            Painéis e relatórios
          </h1>
          <button
            type="button"
            :title="isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'"
            class="shrink-0 min-w-[44px] min-h-[44px] w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-yellow-500 transition-colors"
            @click="toggleFavorite"
          >
            <svg 
              class="w-5 h-5" 
              :fill="isFavorite ? 'currentColor' : 'none'" 
              stroke="currentColor" 
              stroke-width="2" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Barra de ações -->
      <div class="flex flex-col sm:flex-row sm:items-center gap-3">
        
        <!-- Lado esquerdo: ações principais -->
        <div class="flex flex-wrap items-center gap-2 flex-1">
          
          <!-- Adicionar ferramenta -->
          <button
            type="button"
            class="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] bg-[#0073ea] hover:bg-[#0060c0] text-white text-sm font-medium rounded-lg transition-colors"
            @click="$emit('add-widget')"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span class="hidden sm:inline">Adicionar ferramenta</span>
            <span class="sm:hidden">Adicionar</span>
          </button>

          <!-- Quadros conectados -->
          <button
            type="button"
            class="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-medium rounded-lg transition-colors"
            @click="$emit('manage-boards')"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span>{{ connectedBoardsCount }} {{ connectedBoardsCount === 1 ? 'quadro' : 'quadros' }}</span>
          </button>

          <!-- Busca -->
          <div class="relative flex-1 min-w-[200px] max-w-xs">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              :value="searchQuery"
              placeholder="Digite para filtrar"
              class="w-full pl-10 pr-4 py-2 min-h-[44px] text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
              @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
            />
          </div>

          <!-- Pessoas -->
          <button
            type="button"
            :title="filterByPeople.length > 0 ? `Filtrando por ${filterByPeople.length} pessoa(s)` : 'Filtrar por pessoas'"
            class="inline-flex items-center gap-2 px-3 py-2 min-h-[44px] min-w-[44px] bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors relative"
            :class="{ 'ring-2 ring-primary-400': filterByPeople.length > 0 }"
            @click="$emit('toggle-people-filter')"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span v-if="filterByPeople.length > 0" class="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-xs font-semibold rounded-full flex items-center justify-center">
              {{ filterByPeople.length }}
            </span>
          </button>

          <!-- Filtro -->
          <button
            type="button"
            title="Filtros avançados"
            class="inline-flex items-center gap-2 px-3 py-2 min-h-[44px] min-w-[44px] bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors"
            @click="$emit('toggle-filters')"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
        </div>

        <!-- Lado direito: configurações -->
        <div class="flex items-center">
          <button
            type="button"
            title="Configurações do dashboard"
            class="inline-flex items-center justify-center min-h-[44px] min-w-[44px] w-10 h-10 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
            @click="$emit('open-settings')"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from '#imports'

const props = defineProps<{
  connectedBoardsCount: number
  searchQuery: string
  filterByPeople: string[]
}>()

const emit = defineEmits<{
  'add-widget': []
  'manage-boards': []
  'update:searchQuery': [value: string]
  'toggle-people-filter': []
  'toggle-filters': []
  'open-settings': []
  'toggle-favorite': []
}>()

const isFavorite = ref(false)

function toggleFavorite() {
  isFavorite.value = !isFavorite.value
  emit('toggle-favorite')
}
</script>
