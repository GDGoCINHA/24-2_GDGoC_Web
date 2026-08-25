import type { TeamValue, UserRoleValue } from '@/types/profile'

/** dusk 배경 위 태그 색. 배경은 옅게 깔고 글자만 색을 낸다. */
export type ProfileTagTone = 'neutral' | 'green' | 'blue' | 'amber' | 'ember' | 'red'

const TAG_CLASS: Record<ProfileTagTone, string> = {
  neutral: 'bg-[rgba(240,234,228,0.10)] text-dusk-ink-500',
  green: 'bg-[rgba(134,192,143,0.18)] text-signal-ok',
  blue: 'bg-[rgba(126,150,200,0.20)] text-tag-info',
  amber: 'bg-[rgba(224,162,78,0.18)] text-tag-event',
  ember: 'bg-[rgba(208,129,85,0.18)] text-ember',
  red: 'bg-[rgba(217,117,106,0.18)] text-signal-err'
}

/** 권한 안내 띠. 태그보다 넓게 깔리므로 글자를 한 단 밝게 쓴다. */
const BANNER_CLASS: Partial<Record<ProfileTagTone, string>> = {
  green: 'bg-[rgba(134,192,143,0.16)] text-[#A6D0AC]',
  red: 'bg-[rgba(217,117,106,0.16)] text-[#E5A79F]'
}

const ROLE_TONE: Record<UserRoleValue, ProfileTagTone> = {
  GUEST: 'neutral',
  MEMBER: 'neutral',
  CORE: 'green',
  LEAD: 'blue',
  ORGANIZER: 'amber',
  ADMIN: 'red'
}

const ROLE_BANNER: Partial<Record<UserRoleValue, string>> = {
  CORE: '운영진 권한이 부여된 계정입니다.',
  LEAD: '운영진 권한이 부여된 계정입니다.',
  ORGANIZER: '운영진 권한이 부여된 계정입니다.',
  ADMIN: '관리자 권한이 부여된 계정입니다.'
}

const TEAM_TONE: Record<string, ProfileTagTone> = {
  HQ: 'neutral',
  BD: 'red',
  HR: 'blue',
  TECH: 'ember',
  PR_DESIGN: 'amber'
}

export const getRoleTagClass = (role: UserRoleValue): string =>
  TAG_CLASS[ROLE_TONE[role] ?? 'neutral']

export const getRoleBanner = (role: UserRoleValue): string | null => ROLE_BANNER[role] ?? null

/** 띠 색이 없는 권한은 띠 자체를 그리지 않으므로 여기까지 오지 않는다. */
export const getRoleBannerClass = (role: UserRoleValue): string =>
  BANNER_CLASS[ROLE_TONE[role] ?? 'neutral'] ?? ''

export const getTeamTagClass = (team: TeamValue): string =>
  TAG_CLASS[(team ? TEAM_TONE[team] : undefined) ?? 'neutral']

export const getTeamLabel = (team: TeamValue): string => {
  if (!team) return 'NONE'
  return team === 'PR_DESIGN' ? 'PR·DESIGN' : team
}
