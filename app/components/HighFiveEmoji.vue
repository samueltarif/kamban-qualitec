<template>
  <div class="high-five-container">
    <span class="hand hand-left">👋</span>
    <span class="hand hand-right">👋</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  size?: string
}>()
</script>

<style scoped>
.high-five-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
}

.hand {
  font-size: v-bind(size || '2rem');
  display: inline-block;
  animation: wave 1s ease-in-out infinite;
}

.hand-left {
  transform: scaleX(-1);
  animation-delay: 0s;
}

.hand-right {
  animation-delay: 0.5s;
}

@keyframes wave {
  0%, 100% {
    transform: rotate(0deg) translateY(0);
  }
  25% {
    transform: rotate(-15deg) translateY(-5px);
  }
  50% {
    transform: rotate(0deg) translateY(0);
  }
  75% {
    transform: rotate(15deg) translateY(-5px);
  }
}

/* Animação de "bater" as mãos */
.high-five-container:hover .hand {
  animation: clap 0.6s ease-in-out;
}

@keyframes clap {
  0% {
    transform: translateX(0) scale(1);
  }
  50% {
    transform: translateX(var(--move)) scale(1.1);
  }
  100% {
    transform: translateX(0) scale(1);
  }
}

.high-five-container:hover .hand-left {
  --move: 10px;
}

.high-five-container:hover .hand-right {
  --move: -10px;
}
</style>
