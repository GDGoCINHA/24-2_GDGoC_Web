import type { GdgTagColor } from '@/components/ui/design-system/GdgColorTag'
import type { TeamValue, UserRoleValue } from '@/types/profile'

const ROLE_TAG_COLOR: Record<UserRoleValue, GdgTagColor> = {
  GUEST: 'white',
  MEMBER: 'white',
  CORE: 'green',
  LEAD: 'blue',
  ORGANIZER: 'yellow',
  ADMIN: 'red'
}

const ROLE_BANNER: Partial<Record<UserRoleValue, string>> = {
  CORE: '운영진 권한이 부여된 계정입니다.',
  LEAD: '운영진 권한이 부여된 계정입니다.',
  ORGANIZER: '운영진 권한이 부여된 계정입니다.',
  ADMIN: '관리자 권한이 부여된 계정입니다.'
}

const TEAM_TAG_COLOR: Record<string, GdgTagColor> = {
  HQ: 'white',
  BD: 'red',
  HR: 'blue',
  TECH: 'green',
  PR_DESIGN: 'yellow'
}

export const getRoleTagColor = (role: UserRoleValue): GdgTagColor => ROLE_TAG_COLOR[role] ?? 'white'

export const getRoleBanner = (role: UserRoleValue): string | null => ROLE_BANNER[role] ?? null

export const getTeamTagColor = (team: TeamValue): GdgTagColor =>
  team ? (TEAM_TAG_COLOR[team] ?? 'white') : 'white'

export const getTeamLabel = (team: TeamValue): string => {
  if (!team) return 'NONE'
  return team === 'PR_DESIGN' ? 'PR·DESIGN' : team
}
