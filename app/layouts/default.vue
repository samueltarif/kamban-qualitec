<template>
  <div class="flex h-screen overflow-hidden bg-neutral-50">

    <!-- Overlay mobile -->
    <Transition name="fade">
      <div
        v-if="sidebarOpen && isMobile"
        class="fixed inset-0 z-40 bg-neutral-900/40 backdrop-blur-sm"
        @click="sidebarOpen = false"
        aria-hidden="true"
      />
    </Transition>

    <!-- Sidebar — coluna esquerda fixa -->
    <AppSidebar
      :is-open="sidebarOpen"
      :is-mobile="isMobile"
      :workspaces="workspaces"
      :favorites="favorites"
      :recents="recents"
      @add-workspace="handleAddWorkspace"
      @user-menu="handleUserMenu"
      @navigate="handleNavigate"
    />

    <!-- Coluna direita: header + conteúdo + footer -->
    <div class="flex flex-col flex-1 min-w-0 overflow-hidden">

      <!-- Header fixo no topo da coluna direita -->
      <AppHeader @toggle-sidebar="toggleSidebar" />

      <!-- Área de conteúdo com scroll -->
      <main class="flex-1 overflow-y-auto">
        <div class="p-4 md:p-6 lg:p-8">
          <slot />
        </div>
      </main>

      <!-- Footer -->
      <footer class="shrink-0 border-t border-neutral-100 bg-white px-6 py-3 flex items-center justify-between">
        <p class="text-micro text-muted">© {{ new Date().getFullYear() }} Qualitec</p>
        <p class="text-micro text-muted">v1.0.0</p>
      </footer>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useFavorites } from '~/composables/useFavorites'
import { useRecents } from '~/composables/useRecents'
import { useWorkspaces } from '~/composables/useWorkspaces'

const sidebarOpen = ref(false)
const isMobile = ref(false)

// Data from composables
const { favorites, fetchFavorites } = useFavorites()
const { recents, fetchRecents } = useRecents()
const { workspaces: workspacesData, fetchWorkspaces } = useWorkspaces()

// Transform workspaces for sidebar
const workspaces = computed(() => 
  workspacesData.value.map(ws => ({
    id: ws.id,
    name: ws.name,
    slug: ws.slug
  }))
)

function checkMobile() {
  isMobile.value = window.innerWidth < 768
  if (!isMobile.value && !sidebarOpen.value) {
    sidebarOpen.value = true
  }
}

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

function handleAddWorkspace() {
  navigateTo('/workspaces')
}

function handleUserMenu() {
  // TODO: Open user menu dropdown
  console.log('User menu')
}

function handleNavigate() {
  // Close sidebar on mobile after navigation
  if (isMobile.value) {
    sidebarOpen.value = false
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  fetchFavorites()
  fetchRecents()
  fetchWorkspaces()
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
