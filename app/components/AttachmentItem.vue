<template>
  <div class="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-all group">
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
      <div class="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
        <span>{{ formatFileSize(attachment.size_bytes) }}</span>
        <span v-if="attachment.uploader?.full_name">• {{ attachment.uploader.full_name }}</span>
        <span>• {{ formatDate(attachment.created_at) }}</span>
      </div>
    </div>

    <!-- Ações -->
    <div class="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <!-- Visualizar/Download -->
      <button
        type="button"
        class="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
        title="Visualizar/Baixar"
        @click="$emit('view', attachment)"
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
        @click="$emit('delete', attachment)"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TaskAttachmentWithSource } from '~/composables/useTaskAllAttachments'

defineProps<{
  attachment: TaskAttachmentWithSource
}>()

defineEmits<{
  (e: 'view', attachment: TaskAttachmentWithSource): void
  (e: 'delete', attachment: TaskAttachmentWithSource): void
}>()

function getFileIconClass(mimeType: string | null): string {
  if (mimeType?.startsWith('image/')) return 'bg-purple-100 text-purple-600'
  if (mimeType === 'application/pdf') return 'bg-red-100 text-red-600'
  if (mimeType?.includes('word') || mimeType?.includes('document')) return 'bg-blue-100 text-blue-600'
  if (mimeType?.includes('sheet') || mimeType?.includes('excel')) return 'bg-green-100 text-green-600'
  return 'bg-neutral-100 text-neutral-600'
}

function getFileIconPath(mimeType: string | null): string {
  if (mimeType?.startsWith('image/')) return 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
  if (mimeType === 'application/pdf') return 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z'
  return 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'agora'
  if (diffInSeconds < 3600) return `há ${Math.floor(diffInSeconds / 60)}min`
  if (diffInSeconds < 86400) return `há ${Math.floor(diffInSeconds / 3600)}h`
  if (diffInSeconds < 604800) return `há ${Math.floor(diffInSeconds / 86400)}d`
  
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}
</script>
