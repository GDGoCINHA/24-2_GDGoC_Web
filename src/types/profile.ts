export type UserRoleValue = 'GUEST' | 'MEMBER' | 'CORE' | 'LEAD' | 'ORGANIZER' | 'ADMIN'

export type TeamValue = 'HQ' | 'HR' | 'PR_DESIGN' | 'TECH' | 'BD' | null

export type MembershipStatusValue = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface UserProfile {
  id: number
  name: string
  email: string
  studentId: string
  major: string
  phoneNumber: string
  userRole: UserRoleValue
  team: TeamValue
  membershipStatus: MembershipStatusValue
  image: string | null
}

export interface UpdateProfilePayload {
  name: string
  major: string
  phoneNumber: string
}

export type ApplicationStatusValue = 'SUBMITTED' | 'IN_REVIEW' | 'ACCEPTED' | 'REJECTED'

export interface MyCoreApplication {
  applicationId: number
  session: string
  team: string
  resultStatus: ApplicationStatusValue
}
