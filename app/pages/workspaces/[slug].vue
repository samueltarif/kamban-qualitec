<template>
  <div class="max-w-7xl mx-auto">
    <!-- Header -->
    <div class="mb-6">
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-label-sm text-muted mb-4">
        <NuxtLink to="/workspaces" class="hover:text-neutral-900 transition-colors">
          Áreas de trabalho
        </NuxtLink>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <span class="text-neutral-900">{{ workspace?.name || 'Carregando...' }}</span>
      </nav>

      <!-- Title & Actions -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-heading-lg font-semibold text-neutral-900 mb-2">{{ workspace?.name }}</h1>
          <p class="text-body text-muted">Quadros organizados nesta área de trabalho</p>
        </div>
        <ClientOnly>
          <BaseButton
            v-if="isMaster"
            variant="primary"
            @click="showCreateBoardModal = true"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Novo quadro
          </BaseButton>
        </ClientOnly>
      </div>
    </div>

    <!-- Loading State -->
    <LoadingState v-if="loading" message="Carregando quadros..." />

    <!-- Error State -->
    <ErrorState 
      v-else-if="error" 
      :message="error"
      @retry="fetchBoards"
    />

    <!-- Empty State -->
    <EmptyState
      v-else-if="boards.length === 0"
      title="Nenhum quadro nesta área"
      description="Crie seu primeiro quadro para começar a organizar tarefas."
    >
      <ClientOnly>
        <BaseButton
          v-if="isMaster"
          variant="primary"
          @click="showCreateBoardModal = true"
        >
          Criar primeiro quadro
        </BaseButton>
      </ClientOnly>
    </EmptyState>

    <!-- Boards Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="board in boards"
        :key="board.id"
        class="bg-white border border-neutral-200 rounded-xl p-6 hover:shadow-lg hover:border-primary-300 transition-all group cursor-pointer"
        @click="navigateTo(`/boards/${board.id}`)"
      >
        <!-- Header -->
        <div class="flex items-start justify-between mb-4">
          <div 
            class="w-12 h-12 rounded-xl flex items-center justify-center transition-colors"
            :style="{ backgroundColor: board.cover_color || '#E0E7FF' }"
          >
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </div>
          
          <span
            v-if="board.visibility === 'private'"
            class="px-2 py-1 bg-neutral-100 text-neutral-600 text-micro font-medium rounded-md flex items-center gap-1"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Privado
          </span>
        </div>

        <!-- Content -->
        <div class="mb-4">
          <h3 class="text-heading-sm font-semibold text-neutral-900 mb-1 group-hover:text-primary-600 transition-colors">
            {{ board.name }}
          </h3>
          <p v-if="board.description" class="text-label-sm text-muted line-clamp-2">
            {{ board.description }}
          </p>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between text-label-sm text-muted">
          <span class="flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {{ board.board_type === 'kanban' ? 'Kanban' : 'Tabela' }}
          </span>
          
          <svg class="w-5 h-5 text-neutral-400 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Create Board Modal -->
    <BaseModal
      v-model="showCreateBoardModal"
      title="Novo quadro"
    >
      <form @submit.prevent="handleCreateBoard" class="space-y-4">
        <BaseInput
          v-model="newBoard.name"
          label="Nome do quadro"
          placeholder="Ex: Sprint Atual, Vendas Q1"
          required
        />
        
        <BaseInput
          v-model="newBoard.description"
          label="Descrição (opcional)"
          placeholder="Descreva o propósito deste quadro"
        />

        <BaseSelect
          v-model="newBoard.board_type"
          label="Tipo de visualização"
          :options="boardTypeOptions"
        />

        <BaseSelect
          v-model="newBoard.visibility"
          label="Visibilidade"
          :options="visibilityOptions"
        />

        <!-- Error message -->
        <div v-if="error" class="bg-danger-50 border border-danger-200 rounded-xl px-4 py-3">
          <p class="text-body-sm text-danger-700">{{ error }}</p>
        </div>

        <div class="flex gap-3 justify-end pt-4">
          <BaseButton
            type="button"
            variant="ghost"
            @click="showCreateBoardModal = false"
          >
            Cancelar
          </BaseButton>
          <BaseButton
            type="submit"
            variant="primary"
            :disabled="!newBoard.name || loading"
          >
            {{ loading ? 'Criando...' : 'Criar quadro' }}
          </BaseButton>
        </div>
      </form>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useWorkspaces } from '~/composables/useWorkspaces'
import { useBoards } from '~/composables/useBoards'
import { useAuth } from '~/composables/useAuth'
import type { Database } from '#shared/types/database'

const route = useRoute()
const slug = computed(() => route.params.slug as string)

const { workspaces, fetchWorkspaces } = useWorkspaces()
const { boards, loading, error, fetchBoardsByWorkspace, createBoard } = useBoards()
const { isMaster } = useAuth()

const workspace = computed(() => 
  workspaces.value.find(w => w.slug === slug.value)
)

const showCreateBoardModal = ref(false)

const newBoard = ref({
  name: '',
  description: '',
  board_type: 'list' as Database['public']['Enums']['board_type'],
  visibility: 'org' as Database['public']['Enums']['visibility_type']
})

const boardTypeOptions = [
  { value: 'list', label: 'Tabela (visualização em lista)' },
  { value: 'kanban', label: 'Kanban (colunas de status)' },
  { value: 'scrum', label: 'Scrum (sprints e backlog)' }
]

const visibilityOptions = [
  { value: 'org', label: 'Organização (todos podem ver)' },
  { value: 'private', label: 'Privado (apenas membros convidados)' }
]

async function fetchBoards() {
  if (!workspace.value) return
  await fetchBoardsByWorkspace(workspace.value.id)
}

async function handleCreateBoard() {
  if (!workspace.value) {
    console.error('[slug].vue handleCreateBoard: workspace not found')
    return
  }

  console.log('[slug].vue handleCreateBoard: creating board with workspace:', {
    workspaceId: workspace.value.id,
    workspaceName: workspace.value.name,
    workspaceSlug: workspace.value.slug
  })

  const result = await createBoard({
    name: newBoard.value.name,
    description: newBoard.value.description || null,
    workspace_id: workspace.value.id,
    board_type: newBoard.value.board_type,
    visibility: newBoard.value.visibility
  })

  if (result) {
    showCreateBoardModal.value = false
    newBoard.value = {
      name: '',
      description: '',
      board_type: 'list',
      visibility: 'org'
    }
  } else {
    console.error('[slug].vue handleCreateBoard: failed to create board')
  }
}

onMounted(async () => {
  console.log('[slug].vue mounted, slug:', slug.value)
  
  await fetchWorkspaces()
  console.log('[slug].vue workspaces loaded:', workspaces.value.length)
  console.log('[slug].vue workspace found:', workspace.value)
  
  if (!workspace.value) {
    console.error('[slug].vue workspace not found, redirecting')
    navigateTo('/workspaces')
    return
  }

  await fetchBoards()
  console.log('[slug].vue boards loaded:', boards.value.length)
})
</script>
