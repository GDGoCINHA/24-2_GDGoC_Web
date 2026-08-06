import type { UserRoleValue } from '@/types/profile'

export const ROLE_ORDER: UserRoleValue[] = ['GUEST', 'MEMBER', 'CORE', 'LEAD', 'ORGANIZER', 'ADMIN']

const rankOf = (role: string | undefined | null): number => {
  const index = ROLE_ORDER.indexOf((role ?? 'GUEST') as UserRoleValue)
  return index === -1 ? 0 : index
}

export const hasAtLeast = (
  currentRole: string | undefined | null,
  minimumRole: UserRoleValue
): boolean => rankOf(currentRole) >= rankOf(minimumRole)
