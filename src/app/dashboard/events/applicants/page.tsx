'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

import AdminHeader from '@/components/admin/dashboard/AdminHeader'
import AdminPagination from '@/components/admin/dashboard/AdminPagination'
import {
  ADMIN_CAPTION,
  ADMIN_CELL_SELECT,
  ADMIN_CONTAINER,
  ADMIN_EMPTY_CELL,
  ADMIN_ERROR_BANNER,
  ADMIN_GHOST_BUTTON,
  ADMIN_OPTION,
  ADMIN_PAGE,
  ADMIN_PILL,
  ADMIN_PILL_SELECT,
  ADMIN_TABLE_CARD,
  ADMIN_TD,
  ADMIN_TD_MUTED,
  ADMIN_TH,
  ADMIN_TITLE,
  ADMIN_TR
} from '@/components/admin/dashboard/adminStyles'
import ProxyRegisterPanel from '@/components/eventApplication/ProxyRegisterPanel'
import Loader from '@/components/ui/common/Loader'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import {
  downloadApplicantsCsv,
  fetchApplicants,
  fetchEventForm,
  updateAttendance
} from '@/services/eventApplication/eventApplicationClient'
import {
  ATTENDANCE_LABEL,
  type Applicant,
  type ApplicationStatus,
  type EventAttendanceStatus,
  type FormQuestion,
  type EventForm
} from '@/types/eventApplication'
import { formatDate } from '@/utils/formatDate'

const HEADER_LINKS = [
  { label: '대시보드', href: '/dashboard' },
  { label: '행사 게시판', href: '/board/events' }
]

const PAGE_SIZE = 50

const STATUS_CHOICES: { value: ApplicationStatus | ''; label: string }[] = [
  { value: 'APPLIED', label: '신청자만' },
  { value: '', label: '취소 포함 전체' },
  { value: 'CANCELED', label: '취소한 사람만' }
]

const ATTENDANCE_CHOICES: EventAttendanceStatus[] = ['PENDING', 'ATTENDED', 'NO_SHOW']

export default function EventApplicantsPage() {
  const searchParams = useSearchParams()
  const idParam = searchParams.get('id')
  const eventBoardId = idParam ? Number(idParam) : NaN

  const { apiClient } = useAuthenticatedApi()

  const [form, setForm] = useState<EventForm | null>(null)
  const [applicants, setApplicants] = useState<Applicant[]>([])
  // AdminPagination 은 1부터 센다. API 는 0부터라 호출할 때만 한 칸 뺀다.
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [status, setStatus] = useState<ApplicationStatus | ''>('APPLIED')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (Number.isNaN(eventBoardId)) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const [loadedForm, paged] = await Promise.all([
        fetchEventForm(apiClient, eventBoardId),
        fetchApplicants(apiClient, eventBoardId, {
          page: page - 1,
          size: PAGE_SIZE,
          status: status === '' ? undefined : status
        })
      ])
      setForm(loadedForm)
      setApplicants(paged.items)
      setTotalPages(paged.meta.totalPages)
      setTotalElements(paged.meta.totalElements)
    } catch (e) {
      setError(readErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [apiClient, eventBoardId, page, status])

  useEffect(() => {
    void load()
  }, [load])

  /** 삭제된 질문도 열로 남긴다. 지운 뒤에도 과거 답변은 살아 있다. */
  const questions = useMemo(() => form?.questions ?? [], [form])

  const handleAttendance = async (applicationId: number, next: EventAttendanceStatus) => {
    setError(null)
    try {
      await updateAttendance(apiClient, eventBoardId, applicationId, next)
      setApplicants((prev) =>
        prev.map((applicant) =>
          applicant.applicationId === applicationId
            ? { ...applicant, attendanceStatus: next }
            : applicant
        )
      )
    } catch (e) {
      setError(readErrorMessage(e))
    }
  }

  const handleCsv = async () => {
    setError(null)
    try {
      const blob = await downloadApplicantsCsv(
        apiClient,
        eventBoardId,
        status === '' ? undefined : status
      )
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `${form?.eventTitle ?? '행사'}_신청자.csv`
      anchor.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError(readErrorMessage(e))
    }
  }

  if (Number.isNaN(eventBoardId)) {
    return (
      <main className={ADMIN_PAGE}>
        <AdminHeader links={HEADER_LINKS} />
        <section className={`${ADMIN_CONTAINER} pt-10`}>
          <p className={ADMIN_ERROR_BANNER}>행사를 찾을 수 없습니다. 주소를 확인해주세요.</p>
        </section>
      </main>
    )
  }

  return (
    <main className={ADMIN_PAGE}>
      <AdminHeader links={HEADER_LINKS} />
      <Loader isLoading={loading} />

      <section className={`${ADMIN_CONTAINER} pt-[clamp(20px,2.5vw,32px)]`}>
        <p data-admin-reveal className={ADMIN_CAPTION}>
          신청자
        </p>
        <div data-admin-reveal className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h1 className={ADMIN_TITLE}>{form?.eventTitle ?? '신청자 목록'}</h1>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/dashboard/events/form/?id=${eventBoardId}`}
              className={ADMIN_GHOST_BUTTON}
            >
              폼 편집
            </Link>
            <Link
              href={`/dashboard/events/checkin/?id=${eventBoardId}`}
              className={ADMIN_GHOST_BUTTON}
            >
              QR 띄우기
            </Link>
            <button type="button" className={ADMIN_GHOST_BUTTON} onClick={handleCsv}>
              CSV 내려받기
            </button>
          </div>
        </div>

        <div data-admin-reveal className="mt-5 flex flex-wrap items-center gap-3">
          <label className={ADMIN_PILL}>
            <span className="text-[13px] text-admin-ink-dim">범위</span>
            <select
              className={ADMIN_PILL_SELECT}
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as ApplicationStatus | '')
                setPage(1)
              }}
            >
              {STATUS_CHOICES.map((choice) => (
                <option key={choice.label} value={choice.value} className={ADMIN_OPTION}>
                  {choice.label}
                </option>
              ))}
            </select>
          </label>
          <p className="text-[13px] text-admin-ink-dim">
            {totalElements}명{form?.capacity != null ? ` · 정원 ${form.capacity}명` : ''}
          </p>
        </div>

        {error && <p className={ADMIN_ERROR_BANNER}>{error}</p>}

        {form && (
          <div data-admin-reveal className="mt-5">
            <ProxyRegisterPanel eventBoardId={eventBoardId} onRegistered={load} />
          </div>
        )}

        <div data-admin-reveal className={`${ADMIN_TABLE_CARD} mt-5`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse">
              <thead>
                <tr>
                  <th className={ADMIN_TH}>이름</th>
                  <th className={ADMIN_TH}>학번</th>
                  <th className={ADMIN_TH}>학과</th>
                  <th className={ADMIN_TH}>신청일</th>
                  <th className={ADMIN_TH}>참석</th>
                  {questions.map((question) => (
                    <th key={question.id} className={ADMIN_TH}>
                      {question.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {applicants.length === 0 && !loading ? (
                  <tr>
                    <td className={ADMIN_EMPTY_CELL} colSpan={5 + questions.length}>
                      아직 신청자가 없습니다.
                    </td>
                  </tr>
                ) : (
                  applicants.map((applicant) => (
                    <tr key={applicant.applicationId} className={ADMIN_TR}>
                      <td className={ADMIN_TD}>
                        {applicant.name}
                        {applicant.status === 'CANCELED' && (
                          <span className="ml-1.5 text-[12px] text-admin-ink-dim">(취소)</span>
                        )}
                      </td>
                      <td className={ADMIN_TD_MUTED}>{applicant.studentId}</td>
                      <td className={ADMIN_TD_MUTED}>{applicant.major}</td>
                      <td className={ADMIN_TD_MUTED}>{formatDate(applicant.appliedAt)}</td>
                      <td className={ADMIN_TD}>
                        <div className="flex items-center gap-1.5">
                          <select
                            className={ADMIN_CELL_SELECT}
                            value={applicant.attendanceStatus}
                            disabled={applicant.status === 'CANCELED'}
                            onChange={(e) =>
                              handleAttendance(
                                applicant.applicationId,
                                e.target.value as EventAttendanceStatus
                              )
                            }
                          >
                            {ATTENDANCE_CHOICES.map((choice) => (
                              <option key={choice} value={choice} className={ADMIN_OPTION}>
                                {ATTENDANCE_LABEL[choice]}
                              </option>
                            ))}
                          </select>
                          {applicant.checkedInAt && (
                            <span className="shrink-0 text-[12px] text-admin-ink-dim">QR</span>
                          )}
                        </div>
                      </td>
                      {questions.map((question) => (
                        <td key={question.id} className={ADMIN_TD_MUTED}>
                          {renderAnswer(applicant.answers?.[String(question.id)], question)}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="pb-12">
          <AdminPagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </section>
    </main>
  )
}

/**
 * 답변에는 선택지의 value 가 들어 있다. 운영진이 보는 표에는 label 로 바꿔 보여준다.
 * 선택지를 지웠거나 자유 입력이면 저장된 값을 그대로 쓴다.
 */
const renderAnswer = (value: unknown, question: FormQuestion): string => {
  const labelOf = (raw: unknown): string => {
    const text = String(raw)
    return question.options?.find((option) => option.value === text)?.label ?? text
  }
  if (value == null) return ''
  if (Array.isArray(value)) return value.map(labelOf).join(', ')
  if (typeof value === 'boolean') return value ? 'O' : 'X'
  return labelOf(value)
}

const readErrorMessage = (error: unknown): string => {
  const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
  return message ?? '처리하지 못했습니다. 잠시 후 다시 시도해주세요.'
}
