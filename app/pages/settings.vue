<template>
  <div>
    <h2 class="text-title-lg text-strong mb-1">Configurações</h2>
    <p class="text-body-md text-subtle">Configurações da organização.</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: ['master-only'],
})
</script>
