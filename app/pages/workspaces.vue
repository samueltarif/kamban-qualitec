<template>
  <div class="max-w-7xl mx-auto">
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-heading-lg font-semibold text-neutral-900 mb-2">Áreas de trabalho</h1>
        <p class="text-body text-muted">Organize seus quadros por contexto, time ou projeto</p>
      </div>
      <ClientOnly>
        <BaseButton
          v-if="isMaster"
          variant="primary"
          @click="handleOpenModal"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nova área
        </BaseButton>
      </ClientOnly>
    </div>

    <!-- Loading State -->
    <LoadingState v-if="loading" message="Carregando áreas de trabalho..." />

    <!-- Error State -->
    <ErrorState 
      v-else-if="error" 
      :message="error"
      @retry="fetchWorkspaces"
    />

    <!-- Empty State -->
    <EmptyState
      v-else-if="workspaces.length === 0"
      title="Nenhuma área de trabalho"
      description="Crie sua primeira área para começar a organizar seus quadros."
    >
      <ClientOnly>
        <BaseButton
          v-if="isMaster"
          variant="primary"
          @click="showCreateModal = true"
        >
          Criar primeira área
        </BaseButton>
      </ClientOnly>
    </EmptyState>

    <!-- Workspaces Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <WorkspaceCard
        v-for="workspace in workspaces"
        :key="workspace.id"
        :workspace="workspace"
        @click="navigateTo(`/workspaces/${workspace.slug}`)"
        @edit="handleEdit(workspace)"
        @delete="handleDeleteConfirm(workspace)"
      />
    </div>

    <!-- Edit Modal -->
    <BaseModal
      v-model="showEditModal"
      title="Editar área de trabalho"
    >
      <form @submit.prevent="handleUpdate" class="space-y-4">
        <BaseInput
          v-model="editWorkspace.name"
          label="Nome"
          placeholder="Ex: Marketing, Desenvolvimento, Vendas"
          required
        />
        
        <BaseInput
          v-model="editWorkspace.slug"
          label="Identificador (slug)"
          placeholder="Ex: marketing, dev, vendas"
          required
          :helper-text="'URL: /workspaces/' + (editWorkspace.slug || 'slug')"
        />

        <BaseSelect
          v-model="editWorkspace.visibility"
          label="Visibilidade"
          :options="visibilityOptions"
        />

        <div class="flex gap-3 justify-end pt-4">
          <BaseButton
            type="button"
            variant="ghost"
            @click="showEditModal = false"
          >
            Cancelar
          </BaseButton>
          <BaseButton
            type="submit"
            variant="primary"
            :disabled="!editWorkspace.name || !editWorkspace.slug"
          >
            Salvar alterações
          </BaseButton>
        </div>
      </form>
    </BaseModal>

    <!-- Delete Confirmation Modal -->
    <BaseModal
      v-model="showDeleteModal"
      title="Excluir área de trabalho"
      size="sm"
    >
      <div class="space-y-4">
        <p class="text-body text-neutral-700">
          Tem certeza que deseja excluir a área <strong>{{ workspaceToDelete?.name }}</strong>?
        </p>
        <p class="text-label-sm text-danger-600">
          Esta ação não pode ser desfeita. Todos os quadros desta área também serão removidos.
        </p>

        <div class="flex gap-3 justify-end pt-4">
          <BaseButton
            type="button"
            variant="ghost"
            @click="showDeleteModal = false"
          >
            Cancelar
          </BaseButton>
          <BaseButton
            variant="danger"
            @click="handleDelete"
          >
            Excluir área
          </BaseButton>
        </div>
      </div>
    </BaseModal>

    <!-- Create Modal -->
    <BaseModal
      v-model="showCreateModal"
      title="Nova área de trabalho"
    >
      <form @submit.prevent="handleCreate" class="space-y-4">
        <BaseInput
          v-model="newWorkspace.name"
          label="Nome"
          placeholder="Ex: Marketing, Desenvolvimento, Vendas"
          required
        />
        
        <BaseInput
          v-model="newWorkspace.slug"
          label="Identificador (slug)"
          placeholder="Ex: marketing, dev, vendas"
          required
          :helper-text="'URL: /workspaces/' + (newWorkspace.slug || 'slug')"
        />

        <BaseSelect
          v-model="newWorkspace.visibility"
          label="Visibilidade"
          :options="visibilityOptions"
        />

        <div class="flex gap-3 justify-end pt-4">
          <BaseButton
            type="button"
            variant="ghost"
            @click="showCreateModal = false"
          >
            Cancelar
          </BaseButton>
          <BaseButton
            type="submit"
            variant="primary"
            :disabled="!newWorkspace.name || !newWorkspace.slug"
          >
            Criar área
          </BaseButton>
        </div>
      </form>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useWorkspaces } from '~/composables/useWorkspaces'
import { useAuth } from '~/composables/useAuth'
import type { Database, Tables } from '~/shared/types/database'

const { workspaces, loading, error, fetchWorkspaces, createWorkspace, updateWorkspace, deleteWorkspace } = useWorkspaces()
const { isMaster } = useAuth()

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)

const newWorkspace = ref({
  name: '',
  slug: '',
  visibility: 'org' as Database['public']['Enums']['visibility_type']
})

const editWorkspace = ref({
  id: '',
  name: '',
  slug: '',
  visibility: 'org' as Database['public']['Enums']['visibility_type']
})

const workspaceToDelete = ref<Tables<'workspaces'> | null>(null)

const visibilityOptions = [
  { value: 'org', label: 'Organização (todos podem ver)' },
  { value: 'private', label: 'Privado (apenas membros convidados)' }
]

function handleOpenModal() {
  console.log('Opening modal, isMaster:', isMaster.value)
  showCreateModal.value = true
}

async function handleCreate() {
  console.log('Creating workspace:', newWorkspace.value)
  const result = await createWorkspace(
    newWorkspace.value.name,
    newWorkspace.value.slug,
    newWorkspace.value.visibility
  )

  console.log('Create result:', result)

  if (result) {
    showCreateModal.value = false
    newWorkspace.value = {
      name: '',
      slug: '',
      visibility: 'org'
    }
  }
}

function handleEdit(workspace: Tables<'workspaces'>) {
  editWorkspace.value = {
    id: workspace.id,
    name: workspace.name,
    slug: workspace.slug,
    visibility: workspace.visibility
  }
  showEditModal.value = true
}

async function handleUpdate() {
  const result = await updateWorkspace(editWorkspace.value.id, {
    name: editWorkspace.value.name,
    slug: editWorkspace.value.slug,
    visibility: editWorkspace.value.visibility
  })

  if (result) {
    showEditModal.value = false
  }
}

function handleDeleteConfirm(workspace: Tables<'workspaces'>) {
  workspaceToDelete.value = workspace
  showDeleteModal.value = true
}

async function handleDelete() {
  if (!workspaceToDelete.value) return

  const result = await deleteWorkspace(workspaceToDelete.value.id)

  if (result) {
    showDeleteModal.value = false
    workspaceToDelete.value = null
  }
}

onMounted(() => {
  console.log('Workspaces page mounted, isMaster:', isMaster.value)
  fetchWorkspaces()
})
</script>
