<template>
  <div class="max-w-7xl mx-auto">

    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-heading-lg font-semibold text-neutral-900 mb-1">Quadros</h1>
        <p class="text-body text-muted">Todos os quadros da organização</p>
      </div>
      <ClientOnly>
        <BaseButton variant="primary" @click="showCreateModal = true">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Novo quadro
        </BaseButton>
      </ClientOnly>
    </div>

    <!-- Filtro por workspace -->
    <div class="mb-5 flex flex-wrap gap-2">
      <button
        @click="selectedWorkspace = null"
        :class="[
          'px-3 py-1.5 rounded-lg text-label-sm font-medium transition-colors',
          selectedWorkspace === null
            ? 'bg-primary-600 text-white'
            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
        ]"
      >
        Todos
      </button>
      <button
        v-for="ws in workspaces"
        :key="ws.id"
        @click="selectedWorkspace = ws.id"
        :class="[
          'px-3 py-1.5 rounded-lg text-label-sm font-medium transition-colors',
          selectedWorkspace === ws.id
            ? 'bg-primary-600 text-white'
            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
        ]"
      >
        {{ ws.name }}
      </button>
    </div>

    <LoadingState v-if="loading" message="Carregando quadros..." />
    <ErrorState v-else-if="error" :message="error" @retry="loadBoards" />

    <EmptyState
      v-else-if="filteredBoards.length === 0"
      title="Nenhum quadro encontrado"
      description="Crie seu primeiro quadro para começar a organizar tarefas."
    >
      <BaseButton variant="primary" @click="showCreateModal = true">
        Criar primeiro quadro
      </BaseButton>
    </EmptyState>

    <!-- Grid de boards -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div
        v-for="board in filteredBoards"
        :key="board.id"
        class="group bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-primary-300 transition-all cursor-pointer"
        @click="navigateTo(`/boards/${board.id}`)"
      >
        <!-- Cover -->
        <div
          class="h-20 flex items-center justify-center"
          :style="`background: ${board.cover_color || '#6366f1'}`"
        >
          <svg class="w-8 h-8 text-white/70" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
        </div>

        <!-- Info -->
        <div class="p-4">
          <div class="flex items-start justify-between gap-2 mb-1">
            <h3 class="text-heading-sm font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors truncate">
              {{ board.name }}
            </h3>
            <span class="shrink-0 px-2 py-0.5 text-micro font-medium rounded-full" :class="boardTypeClass(board.board_type)">
              {{ boardTypeLabel(board.board_type) }}
            </span>
          </div>
          <p v-if="board.description" class="text-label-sm text-muted line-clamp-2 mb-3">
            {{ board.description }}
          </p>
          <div class="flex items-center justify-between text-micro text-muted">
            <span class="flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              {{ visibilityLabel(board.visibility) }}
            </span>
            <span>{{ formatDate(board.created_at) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de criação -->
    <BaseModal v-model="showCreateModal" title="Novo quadro" size="md">
      <form @submit.prevent="handleCreate" class="space-y-4">

        <BaseInput
          v-model="form.name"
          label="Nome do quadro"
          placeholder="Ex: Comercial, Produção, Expedição"
          required
          :error="formErrors.name"
        />

        <div>
          <label class="text-label-md text-default block mb-1.5">Descrição <span class="text-muted">(opcional)</span></label>
          <textarea
            v-model="form.description"
            rows="2"
            placeholder="Descreva o objetivo deste quadro..."
            class="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-body-sm text-strong placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all resize-none"
          />
        </div>

        <BaseSelect
          v-model="form.workspace_id"
          label="Área de trabalho"
          :options="workspaceOptions"
          :error="formErrors.workspace_id"
        />

        <div class="grid grid-cols-2 gap-3">
          <BaseSelect
            v-model="form.board_type"
            label="Tipo"
            :options="boardTypeOptions"
          />
          <BaseSelect
            v-model="form.visibility"
            label="Visibilidade"
            :options="visibilityOptions"
          />
        </div>

        <!-- Cor de capa -->
        <div>
          <label class="text-label-md text-default block mb-2">Cor de capa</label>
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="color in coverColors"
              :key="color"
              type="button"
              @click="form.cover_color = color"
              class="w-8 h-8 rounded-lg border-2 transition-all"
              :style="`background: ${color}`"
              :class="form.cover_color === color ? 'border-neutral-900 scale-110' : 'border-transparent'"
            />
          </div>
        </div>

        <div v-if="formErrors.general" class="bg-danger-50 border border-danger-200 rounded-xl px-4 py-3">
          <p class="text-body-sm text-danger-700">{{ formErrors.general }}</p>
        </div>

        <div class="flex gap-3 justify-end pt-2">
          <BaseButton type="button" variant="ghost" @click="showCreateModal = false">
            Cancelar
          </BaseButton>
          <BaseButton type="submit" variant="primary" :disabled="loading">
            {{ loading ? 'Criando...' : 'Criar quadro' }}
          </BaseButton>
        </div>
      </form>
    </BaseModal>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useBoards } from '~/composables/useBoards'
import { useWorkspaces } from '~/composables/useWorkspaces'
import type { Database } from '~/shared/types/database'

const { boards, loading, error, fetchBoards, createBoard } = useBoards()
const { workspaces, fetchWorkspaces } = useWorkspaces()

const showCreateModal = ref(false)
const selectedWorkspace = ref<string | null>(null)

const form = ref({
  name: '',
  description: '',
  workspace_id: '',
  board_type: 'kanban' as Database['public']['Enums']['board_type'],
  visibility: 'org' as Database['public']['Enums']['visibility_type'],
  cover_color: '#6366f1'
})

const formErrors = ref({ name: '', workspace_id: '', general: '' })

const coverColors = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f59e0b', '#10b981', '#06b6d4', '#0ea5e9',
  '#64748b', '#1e293b'
]

const boardTypeOptions = [
  { value: 'kanban', label: 'Kanban' },
  { value: 'scrum',  label: 'Scrum' },
  { value: 'list',   label: 'Lista' }
]

const visibilityOptions = [
  { value: 'org',     label: 'Organização' },
  { value: 'private', label: 'Privado' }
]

const workspaceOptions = computed(() =>
  workspaces.value.map(ws => ({ value: ws.id, label: ws.name }))
)

const filteredBoards = computed(() =>
  selectedWorkspace.value
    ? boards.value.filter(b => b.workspace_id === selectedWorkspace.value)
    : boards.value
)

function boardTypeLabel(type: string) {
  return { kanban: 'Kanban', scrum: 'Scrum', list: 'Lista' }[type] ?? type
}

function boardTypeClass(type: string) {
  return {
    kanban: 'bg-indigo-100 text-indigo-700',
    scrum:  'bg-purple-100 text-purple-700',
    list:   'bg-neutral-100 text-neutral-600'
  }[type] ?? 'bg-neutral-100 text-neutral-600'
}

function visibilityLabel(v: string) {
  return { org: 'Organização', private: 'Privado', public: 'Público' }[v] ?? v
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function validate() {
  formErrors.value = { name: '', workspace_id: '', general: '' }
  let ok = true
  if (!form.value.name.trim()) { formErrors.value.name = 'Nome obrigatório.'; ok = false }
  if (!form.value.workspace_id) { formErrors.value.workspace_id = 'Selecione uma área.'; ok = false }
  return ok
}

async function handleCreate() {
  if (!validate()) return

  const result = await createBoard({
    name:         form.value.name.trim(),
    description:  form.value.description.trim() || undefined,
    workspace_id: form.value.workspace_id,
    board_type:   form.value.board_type,
    visibility:   form.value.visibility,
    cover_color:  form.value.cover_color
  })

  if (result) {
    showCreateModal.value = false
    form.value = {
      name: '', description: '', workspace_id: '',
      board_type: 'kanban', visibility: 'org', cover_color: '#6366f1'
    }
  } else {
    formErrors.value.general = 'Erro ao criar quadro. Tente novamente.'
  }
}

async function loadBoards() {
  await fetchBoards()
}

onMounted(async () => {
  await fetchWorkspaces()
  await fetchBoards()
  // pré-selecionar primeiro workspace se existir
  if (workspaces.value.length > 0) {
    form.value.workspace_id = workspaces.value[0].id
  }
})
</script>
