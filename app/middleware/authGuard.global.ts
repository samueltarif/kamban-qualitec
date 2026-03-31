import { PUBLIC_ROUTES } from '#shared/constants/routes'

/**
 * Guard global — roda em TODA navegação.
 * No SSR só verifica o estado em memória (useState).
 * A sessão real é inicializada pelo plugin auth.client.ts no cliente.
 */
export default defineNuxtRouteMiddleware((to) => {
  const isPublic = PUBLIC_ROUTES.some(route => to.path.startsWith(route))
  if (isPublic) return

  // No SSR não temos sessão ainda — deixa passar e o cliente redireciona se necessário
  if (import.meta.server) return

  const user = useState('auth:user')
  if (!user.value) {
    return navigateTo('/login', { replace: true })
  }
})
