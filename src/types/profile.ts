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

export interface MyCoreApplicationDetail {
  applicationId: number
  session: string
  snapshot: {
    name: string
    studentId: string
    phone: string
    major: string
    email: string
  }
  team: string
  motivation: string
  wish: string
  strengths: string
  pledge: string
  fileUrls: string[]
  resultStatus: ApplicationStatusValue
  createdAt: string
  updatedAt: string
}

export interface MemberApplicationAnswer {
  id: number
  /** 서버 InputType enum 의 이름 — 'INTERESTS' 처럼 온다. 폼의 키(gdgInterest)가 아니다. */
  inputType: string
  responseValue: unknown
}

/**
 * 부원 지원서. 서버 SpecifiedMemberResponse 와 같은 모양이다.
 *
 * 코어와 달리 심사 상태가 없다 — 부원 지원은 합불 판정을 하지 않는다.
 */
export interface MyMemberApplication {
  id: number
  name: string
  enrolledClassification: string | null
  phoneNumber: string
  email: string
  gender: string | null
  birth: string | null
  major: string
  studentId: string
  admissionSemester: string | null
  isPayed: boolean
  createdAt: string
  updatedAt: string
  answers: { answers: MemberApplicationAnswer[] } | null
}
