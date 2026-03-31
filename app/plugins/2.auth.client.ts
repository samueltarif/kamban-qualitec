import { useAuth } from '~/composables/useAuth'

export default defineNuxtPlugin(async () => {
  const { initSession } = useAuth()
  await initSession()
})
