<template>
  <div class="board-loading-container">
    <div class="board-loading-content">
      <!-- Animação Lottie -->
      <div ref="animationContainer" class="loading-animation"></div>
      
      <!-- Texto de loading -->
      <div class="loading-text">
        <h3 class="loading-title">{{ title }}</h3>
        <p v-if="message" class="loading-message">{{ message }}</p>
      </div>
      
      <!-- Skeleton opcional para contexto -->
      <div v-if="showSkeleton" class="loading-skeleton">
        <div class="skeleton-row" v-for="i in 3" :key="i">
          <div class="skeleton-cell skeleton-title"></div>
          <div class="skeleton-cell skeleton-status"></div>
          <div class="skeleton-cell skeleton-avatar"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import lottie, { type AnimationItem } from 'lottie-web'

interface Props {
  title?: string
  message?: string
  showSkeleton?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Carregando...',
  message: '',
  showSkeleton: false,
  size: 'md'
})

const animationContainer = ref<HTMLElement | null>(null)
let animation: AnimationItem | null = null

// Tamanhos responsivos
const sizeClasses = {
  sm: 'w-24 h-24 sm:w-32 sm:h-32',
  md: 'w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48',
  lg: 'w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56'
}

onMounted(() => {
  if (animationContainer.value) {
    animation = lottie.loadAnimation({
      container: animationContainer.value,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: '/animations/Bussiness.json'
    })
  }
})

onUnmounted(() => {
  animation?.destroy()
})
</script>

<style scoped>
/* Container principal - mobile first */
.board-loading-container {
  @apply min-h-[400px] w-full flex items-center justify-center p-4;
  @apply sm:min-h-[500px] sm:p-6;
  @apply md:min-h-[600px];
}

.board-loading-content {
  @apply flex flex-col items-center justify-center gap-6;
  @apply max-w-md w-full;
  @apply sm:gap-8;
}

/* Animação Lottie */
.loading-animation {
  @apply w-32 h-32;
  @apply sm:w-40 sm:h-40;
  @apply md:w-48 md:h-48;
  @apply flex items-center justify-center;
}

/* Texto de loading */
.loading-text {
  @apply text-center space-y-2;
  @apply sm:space-y-3;
}

.loading-title {
  @apply text-lg font-semibold;
  @apply sm:text-xl;
  @apply md:text-2xl;
  color: var(--color-text-strong);
}

.loading-message {
  @apply text-sm;
  @apply sm:text-base;
  color: var(--color-text-subtle);
}

/* Skeleton opcional - inspirado no Monday.com */
.loading-skeleton {
  @apply w-full space-y-3 mt-4;
  @apply sm:space-y-4 sm:mt-6;
}

.skeleton-row {
  @apply flex items-center gap-3;
  @apply p-3 rounded-lg;
  @apply sm:gap-4 sm:p-4;
  background: var(--color-neutral-50);
}

.skeleton-cell {
  @apply rounded animate-pulse;
  background: var(--color-neutral-200);
}

.skeleton-title {
  @apply flex-1 h-5;
  @apply sm:h-6;
}

.skeleton-status {
  @apply w-20 h-5;
  @apply sm:w-24 sm:h-6;
}

.skeleton-avatar {
  @apply w-8 h-8 rounded-full;
  @apply sm:w-10 sm:h-10;
}

/* Animação de pulse suave */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
