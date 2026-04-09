<template>
  <div class="login-hero-animation">
    <div ref="animationContainer" class="animation-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import lottie, { type AnimationItem } from 'lottie-web'

const animationContainer = ref<HTMLElement | null>(null)
let animation: AnimationItem | null = null

onMounted(() => {
  if (animationContainer.value) {
    animation = lottie.loadAnimation({
      container: animationContainer.value,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: '/animations/profissional voador.json'
    })
  }
})

onUnmounted(() => {
  animation?.destroy()
})
</script>

<style scoped>
/* Mobile first */
.login-hero-animation {
  @apply w-full flex items-center justify-center mb-6;
}

.animation-container {
  @apply w-32 h-32;
  @apply sm:w-40 sm:h-40;
}
</style>
