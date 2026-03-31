import { useAuth } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return

  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated.value) {
    return navigateTo('/login', { replace: true })
  }

  const allowed: string[] = ['master', 'collaborator']
  if (!user.value || !allowed.includes(user.value.role)) {
    return abortNavigation(
      createError({ statusCode: 403, statusMessage: 'Acesso restrito a colaboradores.' })
    )
  }
})
