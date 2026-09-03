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

/**
 * 부원 정보를 고칠 수 있는가 — 서버 LEAD_OR_HR_RULE 과 같은 규칙이다.
 * CORE 는 조회만 되므로 쓰기 버튼은 이 판정으로 막는다.
 */
export const canManageMembers = (
  currentRole: string | undefined | null,
  currentTeam: string | undefined | null
): boolean => hasAtLeast(currentRole, 'LEAD') || (currentRole === 'CORE' && currentTeam === 'HR')
