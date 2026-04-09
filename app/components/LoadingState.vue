<template>
  <div
    class="loading-state-overlay"
    role="status"
    :aria-label="label"
  >
    <div class="loading-state-content">
      <!-- Animação Lottie -->
      <div ref="animationContainer" :class="animationSize" class="loading-animation"></div>
      
      <!-- Texto -->
      <p class="loading-label">{{ label }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import lottie, { type AnimationItem } from 'lottie-web'

const props = withDefaults(defineProps<{
  label?: string
  size?: 'sm' | 'md' | 'lg'
}>(), {
  label: 'Carregando...',
  size: 'md',
})

const animationContainer = ref<HTMLElement | null>(null)
let animation: AnimationItem | null = null

const animationSize = computed(() => ({
  sm: 'w-48 h-48 sm:w-60 sm:h-60',
  md: 'w-72 h-72 sm:w-96 sm:h-96',
  lg: 'w-96 h-96 sm:w-[30rem] sm:h-[30rem]',
}[props.size]))

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
/* Overlay que cobre toda a tela - mobile first */
.loading-state-overlay {
  @apply fixed inset-0;
  @apply flex items-center justify-center;
  @apply bg-white;
  z-index: 9999;
}

.loading-state-content {
  @apply flex flex-col items-center justify-center gap-4;
  @apply sm:gap-6;
}

.loading-animation {
  @apply flex items-center justify-center;
}

.loading-label {
  @apply text-sm font-medium;
  @apply sm:text-base;
  color: var(--color-text-subtle);
}
</style>
