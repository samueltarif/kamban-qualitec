export type UserRole = 'master' | 'collaborator' | 'guest' | 'observer'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  organizationId: string | null
  fullName?: string
  avatarUrl?: string
}
