<template>
  <Teleport to="body">
    <!-- Overlay -->
    <div
      v-if="open"
      class="fixed inset-0 bg-black/30 z-[9998] backdrop-blur-sm"
      @click="$emit('close')"
    />
    
    <!-- Modal -->
    <div
      v-if="open"
      class="fixed z-[9999] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col"
      :class="isMobile ? 'inset-4 max-h-[calc(100vh-32px)]' : 'w-[600px] max-h-[80vh]'"
      :style="modalStyle"
    >
      <!-- Header -->
      <div class="px-4 py-3 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
        <h3 class="text-sm font-semibold text-neutral-700">Anexos</h3>
        <button
          type="button"
          class="p-1 text-neutral-400 hover:text-neutral-600 rounded transition-colors"
          @click="$emit('close')"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Upload Area -->
      <div class="px-4 py-3 border-b border-neutral-200 bg-neutral-50">
        <input
          ref="fileInputRef"
          type="file"
          multiple
          class="hidden"
          @change="handleFileSelect"
        />
        <button
          type="button"
          class="w-full px-4 py-2.5 border-2 border-dashed border-neutral-300 rounded-lg text-sm font-medium text-neutral-600 hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50 transition-all flex items-center justify-center gap-2"
          @click="fileInputRef?.click()"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Adicionar arquivo
        </button>
      </div>

      <!-- Upload Progress -->
      <div v-if="uploadProgress.length > 0" class="px-4 py-2 border-b border-neutral-200 bg-blue-50">
        <div v-for="progress in uploadProgress" :key="progress.fileName" class="mb-2 last:mb-0">
          <div class="flex items-center justify-between text-xs mb-1">
            <span class="font-medium text-neutral-700 truncate flex-1">{{ progress.fileName }}</span>
            <span
              class="ml-2"
              :class="{
                'text-blue-600': progress.status === 'uploading',
                'text-green-600': progress.status === 'success',
                'text-red-600': progress.status === 'error'
              }"
            >
              {{ progress.status === 'uploading' ? `${progress.progress}%` : progress.status === 'success' ? '✓' : '✗' }}
            </span>
          </div>
          <div v-if="progress.status === 'uploading'" class="w-full bg-neutral-200 rounded-full h-1.5">
            <div
              class="bg-blue-600 h-1.5 rounded-full transition-all"
              :style="{ width: `${progress.progress}%` }"
            />
          </div>
          <p v-if="progress.error" class="text-xs text-red-600 mt-1">{{ progress.error }}</p>
        </div>
      </div>

      <!-- Lista de anexos -->
      <div class="flex-1 overflow-y-auto p-4">
        <!-- Loading -->
        <div v-if="loading" class="space-y-2">
          <div v-for="i in 3" :key="i" class="h-16 bg-neutral-100 rounded-lg animate-pulse" />
        </div>

        <!-- Sem anexos -->
        <div v-else-if="attachments.length === 0" class="py-12 text-center">
          <svg class="w-12 h-12 mx-auto text-neutral-300 mb-3" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          <p class="text-sm text-neutral-400">Nenhum anexo ainda</p>
          <p class="text-xs text-neutral-400 mt-1">Clique em "Adicionar arquivo" para começar</p>
        </div>

        <!-- Lista de arquivos -->
        <div v-else class="space-y-2">
          <div
            v-for="attachment in attachments"
            :key="attachment.id"
            class="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-all group"
          >
            <!-- Ícone do arquivo -->
            <div class="flex-shrink-0">
              <div
                class="w-10 h-10 rounded-lg flex items-center justify-center"
                :class="getFileIconClass(attachment.mime_type)"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" :d="getFileIconPath(attachment.mime_type)" />
                </svg>
              </div>
            </div>

            <!-- Info do arquivo -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-neutral-700 truncate">{{ attachment.file_name }}</p>
              <p class="text-xs text-neutral-400">
                {{ formatFileSize(attachment.size_bytes) }}
                <span v-if="attachment.uploader?.full_name" class="ml-2">
                  • {{ attachment.uploader.full_name }}
                </span>
              </p>
            </div>

            <!-- Ações -->
            <div class="flex-shrink-0 flex items-center gap-1">
              <!-- Visualizar/Download -->
              <button
                type="button"
                class="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                title="Visualizar/Baixar"
                @click="handleView(attachment)"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>

              <!-- Deletar -->
              <button
                type="button"
                class="p-2 text-neutral-400 hover:text-danger-600 hover:bg-danger-50 rounded transition-colors"
                title="Remover"
                @click="handleDelete(attachment.id)"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useTaskAttachments, type TaskAttachment } from '~/composables/useTaskAttachments'

const props = defineProps<{
  taskId: string
  isSubtask?: boolean
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { attachments, loading, uploading, uploadProgress, fetchAttachments, uploadFile, deleteAttachment, getDownloadUrl } = useTaskAttachments(props.taskId, props.isSubtask)

const fileInputRef = ref<HTMLInputElement | null>(null)
const isMobile = ref(false)
const modalStyle = ref<Record<string, string>>({})

const isImage = (mimeType: string | null) => mimeType?.startsWith('image/')
const isPdf = (mimeType: string | null) => mimeType === 'application/pdf'

function calcPosition() {
  isMobile.value = window.innerWidth < 768
  
  if (!isMobile.value) {
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const modalWidth = 600
    const modalHeight = Math.min(80 * viewportHeight / 100, 700)
    
    const left = (viewportWidth - modalWidth) / 2
    const top = (viewportHeight - modalHeight) / 2
    
    modalStyle.value = {
      top: `${Math.max(16, top)}px`,
      left: `${Math.max(16, left)}px`,
    }
  }
}

async function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  const files = target.files
  if (!files || files.length === 0) return

  for (const file of Array.from(files)) {
    await uploadFile(file)
  }

  // Limpar input
  target.value = ''
  
  // Recarregar lista
  await fetchAttachments()
}

async function handleView(attachment: TaskAttachment) {
  const url = await getDownloadUrl(attachment.file_path)
  if (!url) return

  // Se for imagem ou PDF, abrir em nova aba
  if (isImage(attachment.mime_type) || isPdf(attachment.mime_type)) {
    window.open(url, '_blank')
  } else {
    // Para outros tipos, fazer download
    const a = document.createElement('a')
    a.href = url
    a.download = attachment.file_name
    a.click()
  }
}

async function handleDelete(attachmentId: string) {
  if (!confirm('Tem certeza que deseja remover este anexo?')) return
  
  const success = await deleteAttachment(attachmentId)
  if (success) {
    await fetchAttachments()
  }
}

function getFileIconClass(mimeType: string | null): string {
  if (isImage(mimeType)) return 'bg-purple-100 text-purple-600'
  if (isPdf(mimeType)) return 'bg-red-100 text-red-600'
  if (mimeType?.includes('word') || mimeType?.includes('document')) return 'bg-blue-100 text-blue-600'
  if (mimeType?.includes('sheet') || mimeType?.includes('excel')) return 'bg-green-100 text-green-600'
  return 'bg-neutral-100 text-neutral-600'
}

function getFileIconPath(mimeType: string | null): string {
  if (isImage(mimeType)) return 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
  if (isPdf(mimeType)) return 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z'
  return 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    fetchAttachments()
    calcPosition()
  }
})

onMounted(() => {
  window.addEventListener('resize', calcPosition)
})
</script>
