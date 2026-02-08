export const TEAM_VALUES = ['TECH', 'PR_DESIGN', 'HR', 'BD', 'HQ'] as const

export type TeamValue = (typeof TEAM_VALUES)[number]

export const CORE_TEAM_VALUES: TeamValue[] = ['HR', 'BD', 'TECH', 'PR_DESIGN']

export const TEAM_LABEL_MAP: Record<TeamValue, string> = {
  TECH: 'TECH',
  PR_DESIGN: 'PR·DESIGN',
  HR: 'HR',
  BD: 'BD',
  HQ: 'HQ'
}

export const getTeamLabel = (team?: string | null): string => {
  if (!team) return ''
  return TEAM_LABEL_MAP[team as TeamValue] ?? team
}
