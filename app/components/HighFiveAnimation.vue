<template>
  <div ref="animationContainer" class="high-five-animation"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import lottie, { AnimationItem } from 'lottie-web'

const animationContainer = ref<HTMLElement | null>(null)
let animation: AnimationItem | null = null

const props = defineProps<{
  size?: number
  autoplay?: boolean
  loop?: boolean
}>()

onMounted(() => {
  if (animationContainer.value) {
    // Usando uma animação de high five do LottieFiles
    // URL pública de exemplo - você pode substituir por outra
    animation = lottie.loadAnimation({
      container: animationContainer.value,
      renderer: 'svg',
      loop: props.loop ?? true,
      autoplay: props.autoplay ?? true,
      path: 'https://lottie.host/4c3e0c0d-3c3e-4c0e-9c3e-0c0d3c3e0c0d/xyz.json' // Substitua por uma URL válida
    })
  }
})

onUnmounted(() => {
  animation?.destroy()
})
</script>

<style scoped>
.high-five-animation {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
