import { useAuth } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return

  const { isAuthenticated } = useAuth()
  if (isAuthenticated.value) {
    return navigateTo('/', { replace: true })
  }
})
