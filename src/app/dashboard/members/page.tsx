'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

import Loader from '@/components/ui/common/Loader'
import UserDetailsModal from '@/components/admin/UserDetailsModal'
import { GdgSegmentedButton } from '@/components/ui/design-system'
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

const SEGMENT_WIDTH_PX = Math.max(...PAY_SEGMENTS.map((item) => item.label.length * 16 + 26))

export default function DashboardMembersPage() {
  const { apiClient } = useAuthenticatedApi()

  const [members, setMembers] = useState<RecruitMemberSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [searchInput, setSearchInput] = useState('')
  const [question, setQuestion] = useState('')
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
          ...(question.trim() ? { question: question.trim() } : {})
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
  }, [apiClient, page, question, size])

  useEffect(() => {
    void fetchMembers()
  }, [fetchMembers])

  const handleSearch = () => {
    setPage(1)
    setQuestion(searchInput)
  }

  const handleTogglePay = async (memberId: number, nextState: boolean) => {
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
      const message = e?.response?.data?.message || '입금 상태 변경에 실패했습니다.'
      alert(message)
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
      const message = e?.response?.data?.message || '상세 정보를 불러오지 못했습니다.'
      alert(message)
    } finally {
      setLoading(false)
    }
  }

  const pageNumbers = useMemo(() => {
    const maxVisible = 7
    const pages: number[] = []
    const start = Math.max(1, page - Math.floor(maxVisible / 2))
    const end = Math.min(totalPages, start + maxVisible - 1)
    for (let p = start; p <= end; p += 1) pages.push(p)
    return pages
  }, [page, totalPages])

  return (
    <div className="min-h-screen bg-black px-6 py-8 text-white pc:px-10">
      <Loader isLoading={loading} />

      <div className="mx-auto w-full max-w-[1280px] space-y-6">
        <div className="flex flex-col gap-4 pc:flex-row pc:items-center pc:justify-between">
          <div className="flex items-center gap-3">
            <h1 className="typo-h4 mobile:typo-m-h3">Members Dashboard</h1>
            <Link
              href="/dashboard/users"
              className="inline-flex h-9 items-center rounded-lg border border-white/20 px-3 typo-pc-c2 text-white hover:border-white"
            >
              Users
            </Link>
            <Link
              href="/dashboard/mbti"
              className="inline-flex h-9 items-center rounded-lg border border-white/20 px-3 typo-pc-c2 text-white hover:border-white"
            >
              MBTI
            </Link>
            <Link
              href="/dashboard/memo"
              className="inline-flex h-9 items-center rounded-lg border border-white/20 px-3 typo-pc-c2 text-white hover:border-white"
            >
              Memo 발송
            </Link>
          </div>
          <div className="flex w-full gap-2 pc:w-auto">
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch()
              }}
              placeholder="이름 검색"
              className="h-11 w-full rounded-lg border border-gray-300 bg-gray-100 px-3 text-white outline-none focus:border-white pc:w-[260px]"
            />
            <button
              type="button"
              onClick={handleSearch}
              className="h-11 rounded-lg bg-red px-4 typo-pc-b3 text-white"
            >
              검색
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-gray-100/30 p-4">
          <p className="typo-pc-b3 text-gray-700">
            전체 {totalElements}명 / 페이지 {page} of {totalPages}
          </p>
        </div>

        {error ? (
          <div className="rounded-xl border border-red bg-red-400/30 p-4 typo-pc-b3 text-red">
            {error}
          </div>
        ) : null}

        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[820px] border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-3 typo-pc-b3 text-gray-700">이름</th>
                <th className="px-4 py-3 typo-pc-b3 text-gray-700">학과</th>
                <th className="px-4 py-3 typo-pc-b3 text-gray-700">학번</th>
                <th className="px-4 py-3 typo-pc-b3 text-gray-700">전화번호</th>
                <th className="px-4 py-3 typo-pc-b3 text-gray-700">회비</th>
                <th className="px-4 py-3 typo-pc-b3 text-gray-700">상세</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center typo-pc-b3 text-gray-700">
                    조회된 지원자가 없습니다.
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="border-t border-white/10 bg-black">
                    <td className="px-4 py-3 typo-pc-b3">{member.name}</td>
                    <td className="px-4 py-3 typo-pc-b3">{member.major}</td>
                    <td className="px-4 py-3 typo-pc-b3">{member.studentId}</td>
                    <td className="px-4 py-3 typo-pc-b3">
                      {formatPhoneNumberDisplay(member.phoneNumber)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="inline-flex">
                        {PAY_SEGMENTS.map((segment, index) => {
                          const isPressed = member.isPayed === segment.value
                          const isDisabled = payUpdatingMemberId === member.id
                          return (
                            <GdgSegmentedButton
                              key={segment.label}
                              device="pc"
                              edge={index === 0 ? 'left' : 'right'}
                              state={isDisabled ? 'disabled' : isPressed ? 'pressed' : 'default'}
                              style={{ width: `${SEGMENT_WIDTH_PX}px` }}
                              className="typo-pc-c2"
                              onClick={() => {
                                if (!isDisabled && member.isPayed !== segment.value) {
                                  void handleTogglePay(member.id, segment.value)
                                }
                              }}
                            >
                              {segment.label}
                            </GdgSegmentedButton>
                          )
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => openDetail(member.id)}
                        className="rounded-md border border-white px-3 py-1 typo-pc-c2 text-white hover:bg-white hover:text-black"
                      >
                        보기
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 ? (
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-md border border-white/20 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-40"
            >
              이전
            </button>
            {pageNumbers.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={`rounded-md px-3 py-1 ${
                  p === page ? 'bg-red text-white' : 'border border-white/20 text-white'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-md border border-white/20 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-40"
            >
              다음
            </button>
          </div>
        ) : null}
      </div>

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
