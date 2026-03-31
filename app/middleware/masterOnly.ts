import { useAuth } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return

  const { isAuthenticated, isMaster } = useAuth()

  if (!isAuthenticated.value) {
    return navigateTo('/login', { replace: true })
  }

  if (!isMaster.value) {
    return abortNavigation(
      createError({ statusCode: 403, statusMessage: 'Acesso restrito a administradores.' })
    )
  }
})
