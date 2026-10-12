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
 * 운영진 대시보드(`/dashboard`)에 들어갈 수 있는 최소 역할.
 * 대시보드 가드와 헤더의 「운영」 버튼이 같이 본다 — 따로 적으면 버튼은 보이는데 열면 막히는 일이 생긴다.
 */
export const DASHBOARD_MIN_ROLE: UserRoleValue = 'CORE'

export const canOpenDashboard = (currentRole: string | undefined | null): boolean =>
  hasAtLeast(currentRole, DASHBOARD_MIN_ROLE)

/**
 * 부원 정보를 고칠 수 있는가 — 서버 LEAD_OR_HR_RULE 과 같은 규칙이다.
 * CORE 는 조회만 되므로 쓰기 버튼은 이 판정으로 막는다.
 */
export const canManageMembers = (
  currentRole: string | undefined | null,
  currentTeam: string | undefined | null
): boolean => hasAtLeast(currentRole, 'LEAD') || (currentRole === 'CORE' && currentTeam === 'HR')
