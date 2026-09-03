'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import Loader from '@/components/ui/common/Loader'
import { useAuth } from '@/hooks/useAuth'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import { canManageMembers } from '@/utils/auth/role'

type ApiResponse<T> = {
  code: number
  message: string
  data: T
}

type NotificationTemplateData = {
  semester: string
  defaultSubject: string
  defaultBody: string
  lastSubject: string | null
  lastBody: string | null
}

type NotificationEnqueueData = {
  semester: string
  distinctTargetCount: number
  enqueuedCount: number
  alreadyProcessedCount: number
}

type RetryFailedData = {
  semester: string
  retriedCount: number
}

const CONFIRM_KEYWORD = '발송'

export default function DashboardMemoPage() {
  const { apiClient } = useAuthenticatedApi()
  const { user } = useAuth()
  const canSend = canManageMembers(user?.userRole, user?.team)

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [retrying, setRetrying] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [semester, setSemester] = useState<string>('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [confirmText, setConfirmText] = useState('')

  const [lastResult, setLastResult] = useState<NotificationEnqueueData | null>(null)

  const loadTemplate = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.get<ApiResponse<NotificationTemplateData>>(
        '/admin/recruit/member/memo/notifications/template'
      )
      const data = response.data?.data
      if (!data) {
        setError('기본 문구를 불러오지 못했습니다.')
        return
      }

      setSemester(data.semester)
      setSubject((data.lastSubject || data.defaultSubject || '').trim())
      setBody((data.lastBody || data.defaultBody || '').trim())
    } catch (e: any) {
      const message = e?.response?.data?.message || '기본 문구 조회에 실패했습니다.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [apiClient])

  useEffect(() => {
    void loadTemplate()
  }, [loadTemplate])

  const isFormValid = useMemo(() => {
    return subject.trim().length > 0 && body.trim().length > 0
  }, [body, subject])

  const isConfirmMatched = confirmText.trim() === CONFIRM_KEYWORD
  const canSubmit = isFormValid && isConfirmMatched && !submitting && canSend

  const handleEnqueue = async () => {
    if (!canSubmit) return

    setSubmitting(true)
    try {
      const response = await apiClient.post<ApiResponse<NotificationEnqueueData>>(
        '/admin/recruit/member/memo/notifications/opening',
        {
          subject: subject.trim(),
          body: body.trim()
        }
      )
      const data = response.data?.data
      setLastResult(data ?? null)
      alert(
        `큐잉 완료\n학기: ${data?.semester ?? '-'}\n대상: ${data?.distinctTargetCount ?? 0}명\n신규 큐: ${data?.enqueuedCount ?? 0}건\n이미 처리됨: ${data?.alreadyProcessedCount ?? 0}건`
      )
      setConfirmText('')
    } catch (e: any) {
      const message = e?.response?.data?.message || '메일 큐잉 요청에 실패했습니다.'
      alert(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleRetryFailed = async () => {
    if (retrying) return

    setRetrying(true)
    try {
      const response = await apiClient.post<ApiResponse<RetryFailedData>>(
        '/admin/recruit/member/memo/notifications/retry-failed'
      )
      const data = response.data?.data
      alert(`실패건 재시도 반영 완료\n학기: ${data?.semester ?? '-'}\n재시도 건수: ${data?.retriedCount ?? 0}`)
    } catch (e: any) {
      const message = e?.response?.data?.message || '실패건 재시도 요청에 실패했습니다.'
      alert(message)
    } finally {
      setRetrying(false)
    }
  }

  return (
    <div className="min-h-screen bg-black px-6 py-8 text-white pc:px-10">
      <Loader isLoading={loading} />

      <div className="mx-auto w-full max-w-[980px] space-y-6">
        <div className="space-y-2">
          <h1 className="typo-h4 mobile:typo-m-h3">Memo Notification Dashboard</h1>
          <p className="typo-pc-b3 text-gray-700">
            현재 학기: <span className="text-white">{semester || '-'}</span> (학기+이메일 기준 1회 발송)
          </p>
        </div>

        {error ? (
          <div className="rounded-xl border border-red bg-red-400/30 p-4 typo-pc-b3 text-red">{error}</div>
        ) : null}

        <section className="space-y-3 rounded-xl border border-white/10 bg-gray-100/30 p-4">
          <h2 className="typo-pc-b2 text-white">발송 문구 작성</h2>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="메일 제목"
            className="h-11 w-full rounded-lg border border-gray-300 bg-black px-3 text-white outline-none focus:border-white"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="메일 본문"
            rows={12}
            className="w-full rounded-lg border border-gray-300 bg-black p-3 text-white outline-none focus:border-white"
          />
        </section>

        <section className="space-y-3 rounded-xl border border-white/10 bg-gray-100/30 p-4">
          <h2 className="typo-pc-b2 text-white">미리보기</h2>
          <p className="typo-pc-b3 text-gray-700">제목</p>
          <p className="rounded-md border border-white/10 bg-black p-3 typo-pc-b3 text-white">
            {subject.trim() || '(제목 없음)'}
          </p>
          <p className="typo-pc-b3 text-gray-700">본문</p>
          <pre className="whitespace-pre-wrap rounded-md border border-white/10 bg-black p-3 typo-pc-b3 text-white">
            {body.trim() || '(본문 없음)'}
          </pre>
        </section>

        <section className="space-y-3 rounded-xl border border-white/10 bg-gray-100/30 p-4">
          <h2 className="typo-pc-b2 text-white">발송 실행</h2>
          <p className="typo-pc-b3 text-gray-700">
            실발송 큐잉 전 확인문구 <span className="text-white">{CONFIRM_KEYWORD}</span> 를 입력하세요.
          </p>
          <div className="flex flex-col gap-3 pc:flex-row pc:items-center">
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={`확인문구: ${CONFIRM_KEYWORD}`}
              className="h-11 w-full rounded-lg border border-gray-300 bg-black px-3 text-white outline-none focus:border-white"
            />
            <button
              type="button"
              onClick={handleEnqueue}
              disabled={!canSubmit}
              className="h-11 shrink-0 rounded-lg bg-red px-4 typo-pc-b3 text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting ? '큐잉 중...' : '큐잉 발송'}
            </button>
            <button
              type="button"
              onClick={handleRetryFailed}
              disabled={retrying || !canSend}
              className="h-11 shrink-0 rounded-lg border border-white/20 px-4 typo-pc-b3 text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {retrying ? '재시도 반영 중...' : '실패건 재시도'}
            </button>
          </div>

          {lastResult ? (
            <div className="rounded-lg border border-white/10 bg-black p-3 typo-pc-c2 text-gray-700">
              마지막 큐잉 결과: 대상 {lastResult.distinctTargetCount}명 / 신규 {lastResult.enqueuedCount}건 /
              이미 처리됨 {lastResult.alreadyProcessedCount}건
            </div>
          ) : null}
        </section>
      </div>
    </div>
  )
}
