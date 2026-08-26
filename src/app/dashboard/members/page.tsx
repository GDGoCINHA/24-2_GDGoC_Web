'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import Loader from '@/components/ui/common/Loader'
import UserDetailsModal from '@/components/admin/UserDetailsModal'
import AdminCategoryNav from '@/components/admin/dashboard/AdminCategoryNav'
import AdminHeader from '@/components/admin/dashboard/AdminHeader'
import AdminPagination from '@/components/admin/dashboard/AdminPagination'
import {
  ADMIN_CAPTION,
  ADMIN_CONTAINER,
  ADMIN_EMPTY_CELL,
  ADMIN_ERROR_BANNER,
  ADMIN_GHOST_BUTTON,
  ADMIN_OPTION,
  ADMIN_PAGE,
  ADMIN_PILL,
  ADMIN_PILL_SELECT,
  ADMIN_SEARCH_FIELD,
  ADMIN_SEARCH_INPUT,
  ADMIN_TABLE_CARD,
  ADMIN_TD,
  ADMIN_TD_MUTED,
  ADMIN_TH,
  ADMIN_TH_RIGHT,
  ADMIN_TITLE,
  ADMIN_TR
} from '@/components/admin/dashboard/adminStyles'
import { formatMajorLabel } from '@/constant/majorOptions'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import { formatPhoneNumberDisplay } from '@/utils/phoneNumber'

type RecruitMemberSummary = {
  id: number
  name: string
  phoneNumber: string
  major: string
  studentId: string
  admissionSemester: string | null
  isPayed: boolean
  createdAt?: string
}

type RecruitMemberDetail = {
  id?: number
  name: string
  enrolledClassification?: string
  phoneNumber?: string
  email?: string
  gender?: string
  birth?: string
  major: string
  studentId: string
  admissionSemester?: string
  isPayed: boolean
  createdAt?: string
  updatedAt?: string
  answers?: {
    answers?: Array<{
      id: number
      inputType: string
      responseValue: unknown
    }>
  }
}

type MembersApiResponse = {
  code: number
  message: string
  data: RecruitMemberSummary[]
  meta?: {
    page: number
    size: number
    totalElements: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
    sort: string
    direction: string
  }
}

type MemberDetailApiResponse = {
  code: number
  message: string
  data: RecruitMemberDetail
}

const PAY_SEGMENTS = [
  { label: '미입금', value: false },
  { label: '입금 완료', value: true }
] as const

// 서버 AdmissionSemester enum 과 값을 맞춘다. 목록에 없는 값을 보내면 400 이 난다.
const SEMESTER_OPTIONS = [
  'Y29_2',
  'Y29_1',
  'Y28_2',
  'Y28_1',
  'Y27_2',
  'Y27_1',
  'Y26_2',
  'Y26_1',
  'Y25_2',
  'Y25_1',
  'Y24_2',
  'Y24_1',
  'Y23_2',
  'Y23_1',
  'Y22_2',
  'Y22_1',
  'Y21_2'
] as const

const ALL_SEMESTERS = 'ALL'

const HEADER_LINKS = [
  { label: '← 대시보드', href: '/dashboard' },
  { label: '온보딩 화면', href: '/' }
]

const SIBLING_SCREENS = [
  { label: 'Users', href: '/dashboard/users' },
  { label: 'Core 지원서', href: '/dashboard/core/application' },
  { label: 'Core 출석', href: '/dashboard/core/attendance' }
]

/** 서버 SemesterCalculator 와 같은 규칙 — 1월은 직전 해 2학기, 2~7월 1학기, 8~12월 2학기. */
function currentAdmissionSemester(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const yy = month === 1 ? (year - 1) % 100 : year % 100
  const term = month === 1 ? 2 : month <= 7 ? 1 : 2
  return `Y${String(yy).padStart(2, '0')}_${term}`
}

/**
 * 제출 시각. 목록의 기본 정렬이 createdAt DESC 이므로 이 칸이 정렬 기준을 눈으로 확인시켜 준다.
 * 서버는 Instant(UTC)로 내려주고 toLocaleString 이 보는 사람의 시간대로 옮긴다.
 */
function formatSubmittedAt(value?: string | null): string {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('ko-KR', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/** 'Y26_2' → '2026-2학기' */
function formatSemesterLabel(value?: string | null): string {
  if (!value) return '-'
  const matched = /^Y(\d{2})_(\d)$/.exec(value)
  return matched ? `20${matched[1]}-${matched[2]}학기` : value
}

export default function DashboardMembersPage() {
  const { apiClient } = useAuthenticatedApi()

  const [members, setMembers] = useState<RecruitMemberSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [searchInput, setSearchInput] = useState('')
  const [question, setQuestion] = useState('')
  // 모집 기간에는 이번 학기 지원자만 보는 게 기본이다. 과거 기수는 드롭다운으로 전환한다.
  const [semester, setSemester] = useState<string>(currentAdmissionSemester())
  const [page, setPage] = useState(1)
  const [size] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)

  const [selectedMember, setSelectedMember] = useState<RecruitMemberDetail | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [payUpdatingMemberId, setPayUpdatingMemberId] = useState<number | null>(null)

  const fetchMembers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.get<MembersApiResponse>('/recruit/member', {
        params: {
          page: page - 1,
          size,
          sort: 'createdAt',
          dir: 'DESC',
          ...(question.trim() ? { question: question.trim() } : {}),
          ...(semester !== ALL_SEMESTERS ? { admissionSemester: semester } : {})
        }
      })

      setMembers(response.data?.data ?? [])
      setTotalPages(response.data?.meta?.totalPages || 1)
      setTotalElements(response.data?.meta?.totalElements || 0)
    } catch (e: any) {
      const message =
        e?.response?.data?.message ||
        '지원자 목록을 불러오지 못했습니다. 권한 또는 네트워크 상태를 확인해 주세요.'
      setError(message)
      setMembers([])
      setTotalPages(1)
      setTotalElements(0)
    } finally {
      setLoading(false)
    }
  }, [apiClient, page, question, semester, size])

  useEffect(() => {
    void fetchMembers()
  }, [fetchMembers])

  const handleSearch = () => {
    setPage(1)
    setQuestion(searchInput)
  }

  // 입금 체크는 계정 역할까지 바꾼다 — 서버가 GUEST↔MEMBER 를 함께 옮긴다.
  // 한 번의 오클릭이 권한 변경으로 이어지므로 무엇이 바뀌는지 보여주고 확인을 받는다.
  const confirmPayChange = (memberName: string, nextState: boolean) => {
    const message = nextState
      ? `${memberName} 님을 '입금 완료'로 변경합니다.

` +
        `가입한 계정이 GUEST 라면 MEMBER 로 승격되어 자유게시판에 글을 쓸 수 있게 됩니다.

계속할까요?`
      : `${memberName} 님을 '미입금'으로 변경합니다.

` +
        `가입한 계정이 MEMBER 라면 GUEST 로 내려갑니다. (CORE 이상은 바뀌지 않습니다)

계속할까요?`

    return window.confirm(message)
  }

  const handleTogglePay = async (memberId: number, memberName: string, nextState: boolean) => {
    if (!confirmPayChange(memberName, nextState)) return

    try {
      setPayUpdatingMemberId(memberId)
      await apiClient.patch(`/recruit/member/${memberId}/payment`, { isPayed: nextState })
      setMembers((prev) =>
        prev.map((member) => (member.id === memberId ? { ...member, isPayed: nextState } : member))
      )

      if (selectedMember && selectedMember.studentId) {
        setSelectedMember((prev) => (prev ? { ...prev, isPayed: nextState } : prev))
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || '입금 상태 변경에 실패했습니다.')
    } finally {
      setPayUpdatingMemberId((prev) => (prev === memberId ? null : prev))
    }
  }

  const openDetail = async (memberId: number) => {
    try {
      setLoading(true)
      const response = await apiClient.get<MemberDetailApiResponse>(`/recruit/member/${memberId}`)
      setSelectedMember(response.data?.data ?? null)
      setDetailOpen(true)
    } catch (e: any) {
      setError(e?.response?.data?.message || '상세 정보를 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 아직 오지 않은 학기는 고를 이유가 없다. 현재 학기부터 과거만 남긴다.
  const semesterOptions = useMemo(() => {
    const current = currentAdmissionSemester()
    const index = SEMESTER_OPTIONS.indexOf(current as (typeof SEMESTER_OPTIONS)[number])
    return index >= 0 ? SEMESTER_OPTIONS.slice(index) : SEMESTER_OPTIONS
  }, [])

  return (
    <div className={ADMIN_PAGE}>
      <AdminHeader links={HEADER_LINKS} />
      <Loader isLoading={loading} />

      <section className={`${ADMIN_CONTAINER} pt-[clamp(20px,2.5vw,32px)]`}>
        <p data-admin-reveal className={ADMIN_CAPTION}>
          Members
        </p>
        <div data-admin-reveal className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h1 className={ADMIN_TITLE}>신입 멤버 지원서</h1>
          <span className="text-[14px] text-admin-ink-soft">
            전체 {totalElements}명 · 페이지 {page} / {totalPages}
          </span>
        </div>

        <AdminCategoryNav category="멤버 · 지원" current="Members" siblings={SIBLING_SCREENS} />

        <div data-admin-reveal className="mt-3 flex flex-wrap items-center gap-2.5">
          <label className={ADMIN_SEARCH_FIELD}>
            <span aria-hidden="true" className="text-[14px] text-admin-ink-dim">
              ⌕
            </span>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch()
              }}
              onBlur={handleSearch}
              placeholder="이름 검색"
              className={ADMIN_SEARCH_INPUT}
            />
          </label>

          <label className={ADMIN_PILL}>
            <span className="whitespace-nowrap text-[13px] text-admin-ink-dim">지원 학기</span>
            <select
              value={semester}
              onChange={(e) => {
                setPage(1)
                setSemester(e.target.value)
              }}
              className={ADMIN_PILL_SELECT}
            >
              <option value={ALL_SEMESTERS} className={ADMIN_OPTION}>
                전체
              </option>
              {semesterOptions.map((option) => (
                <option key={option} value={option} className={ADMIN_OPTION}>
                  {formatSemesterLabel(option)}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error ? (
          <p role="alert" className={ADMIN_ERROR_BANNER}>
            {error}
          </p>
        ) : null}
      </section>

      <section data-admin-reveal className={`${ADMIN_CONTAINER} pt-4`}>
        <div className={ADMIN_TABLE_CARD}>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['이름', '학과 · 학번', '지원 학기', '제출 시각', '전화번호', '회비'].map(
                  (label) => (
                    <th key={label} className={ADMIN_TH}>
                      {label}
                    </th>
                  )
                )}
                <th className={ADMIN_TH_RIGHT}>상세</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan={7} className={ADMIN_EMPTY_CELL}>
                    조회된 지원자가 없습니다.
                  </td>
                </tr>
              ) : (
                members.map((member) => {
                  const isUpdating = payUpdatingMemberId === member.id

                  return (
                    <tr key={member.id} className={ADMIN_TR}>
                      <td className={`${ADMIN_TD} whitespace-nowrap text-[15px]`}>{member.name}</td>
                      <td className="px-3.5 py-2.5">
                        <span className="block break-keep text-[14px] text-admin-ink-muted">
                          {formatMajorLabel(member.major)}
                        </span>
                        <span className="mt-[3px] block text-[12px] tabular-nums text-admin-ink-dim">
                          {member.studentId || '-'}
                        </span>
                      </td>
                      <td className={`${ADMIN_TD_MUTED} whitespace-nowrap tabular-nums`}>
                        {formatSemesterLabel(member.admissionSemester)}
                      </td>
                      <td className={`${ADMIN_TD_MUTED} whitespace-nowrap tabular-nums`}>
                        {formatSubmittedAt(member.createdAt)}
                      </td>
                      <td className={`${ADMIN_TD_MUTED} whitespace-nowrap tabular-nums`}>
                        {formatPhoneNumberDisplay(member.phoneNumber)}
                      </td>
                      <td className="px-3.5 py-2.5">
                        {/* 입금 체크는 계정 역할까지 바꾼다. 지금 상태가 어느 쪽인지 한눈에 보여야 한다. */}
                        <div className="inline-flex overflow-hidden rounded-full border border-admin-line">
                          {PAY_SEGMENTS.map((segment) => {
                            const isPressed = member.isPayed === segment.value
                            return (
                              <button
                                key={segment.label}
                                type="button"
                                disabled={isUpdating}
                                aria-pressed={isPressed}
                                onClick={() => {
                                  if (!isUpdating && member.isPayed !== segment.value) {
                                    void handleTogglePay(member.id, member.name, segment.value)
                                  }
                                }}
                                className={`whitespace-nowrap px-3 py-1.5 text-[12px] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
                                  isPressed
                                    ? 'bg-admin-accent text-admin-accent-ink'
                                    : 'text-admin-ink-dim hover:text-admin-ink'
                                }`}
                              >
                                {segment.label}
                              </button>
                            )
                          })}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3.5 py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => void openDetail(member.id)}
                          className={ADMIN_GHOST_BUTTON}
                        >
                          보기
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <AdminPagination page={page} totalPages={totalPages} onChange={setPage} />

      <UserDetailsModal
        user={selectedMember}
        isOpen={detailOpen}
        preventClose={false}
        onClose={() => {
          setDetailOpen(false)
          setSelectedMember(null)
        }}
      />
    </div>
  )
}
