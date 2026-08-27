'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'

import QuestionField from '@/components/eventApplication/QuestionField'
import {
  DUSK_CANCEL_BUTTON,
  DUSK_GHOST_BUTTON,
  DUSK_SUBMIT_BUTTON
} from '@/components/ui/dusk/DuskForm'
import { useAuth } from '@/hooks/useAuth'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import {
  cancelApplication,
  fetchPublicEventForm,
  submitApplication
} from '@/services/eventApplication/eventApplicationClient'
import type { AnswerValue, PublicEventForm } from '@/types/eventApplication'
import {
  collectSubmittableAnswers,
  findMissingRequired,
  visibleQuestionIds
} from '@/utils/eventApplication/questionVisibility'
import { formatDate } from '@/utils/formatDate'

/**
 * 행사 상세 아래에 붙는 신청 영역.
 *
 * 폼이 없는 행사에서는 아무것도 그리지 않는다. 신청을 받지 않는 행사의 화면은
 * 지금까지와 완전히 같아야 한다.
 */
export default function EventApplicationSection({ eventBoardId }: { eventBoardId: number }) {
  const { user } = useAuth()
  const { apiClient } = useAuthenticatedApi()

  const [form, setForm] = useState<PublicEventForm | null>(null)
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState<Record<number, AnswerValue>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const loaded = await fetchPublicEventForm(apiClient, eventBoardId)
      setForm(loaded)
      // 이미 신청했다면 냈던 답을 그대로 채워 다시 볼 수 있게 한다.
      if (loaded.myApplication) {
        const restored: Record<number, AnswerValue> = {}
        Object.entries(loaded.myApplication.answers ?? {}).forEach(([id, value]) => {
          restored[Number(id)] = value
        })
        setAnswers(restored)
      }
    } catch {
      // 폼이 없는 행사는 404 다. 신청을 받지 않는다는 뜻이므로 조용히 넘어간다.
      setForm(null)
    } finally {
      setLoading(false)
    }
  }, [apiClient, eventBoardId])

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    void load()
  }, [user, load])

  const visible = useMemo(
    () => (form ? visibleQuestionIds(form.questions, answers) : new Set<number>()),
    [form, answers]
  )
  const missing = useMemo(
    () => (form ? findMissingRequired(form.questions, answers) : []),
    [form, answers]
  )

  const applied = form?.myApplication?.status === 'APPLIED'

  const handleSubmit = async () => {
    if (!form) return
    setSubmitting(true)
    setError(null)
    try {
      await submitApplication(
        apiClient,
        eventBoardId,
        collectSubmittableAnswers(form.questions, answers)
      )
      await load()
    } catch (e) {
      setError(readErrorMessage(e))
      // 정원이 차서 막힌 경우가 있다. 화면에 남은 "n자리 남음" 이 옛 숫자면 계속 눌러보게 된다.
      await load()
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = async () => {
    // 취소 버튼이 제출 버튼과 같은 자리에 있어 잘못 누르기 쉽다. 정원이 찬 행사면
    // 되돌리지 못할 수도 있으므로 한 번 묻는다.
    if (!window.confirm('신청을 취소할까요? 정원이 찬 경우 다시 신청하지 못할 수 있습니다.')) {
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await cancelApplication(apiClient, eventBoardId)
      setAnswers({})
      await load()
    } catch (e) {
      setError(readErrorMessage(e))
    } finally {
      setSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="border-t border-t-[rgba(240,234,228,0.10)] pt-7">
        <p className="text-sm text-dusk-ink-500">
          신청은 로그인 후 이용할 수 있습니다.{' '}
          <Link href="/login/" className="text-dusk-ink-200 underline">
            로그인하기
          </Link>
        </p>
      </div>
    )
  }

  if (loading || !form) return null

  return (
    <div className="flex flex-col gap-6 border-t border-t-[rgba(240,234,228,0.10)] pt-7">
      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-medium text-dusk-ink-500">신청</p>
        <p className="text-[13px] text-dusk-ink-800">
          {form.closesAt ? `${formatDate(form.closesAt)}까지 신청할 수 있습니다.` : '상시 신청'}
          {form.capacity != null
            ? ` · 정원 ${form.capacity}명 중 ${form.appliedCount}명 신청${
                form.remainingSeats != null && form.remainingSeats > 0
                  ? ` (${form.remainingSeats}자리 남음)`
                  : ''
              }`
            : ''}
        </p>
      </div>

      {applied && (
        <p className="rounded-xl border border-[rgba(208,129,85,0.4)] bg-[rgba(208,129,85,0.10)] px-4 py-3 text-[15px] text-ember">
          신청이 완료되었습니다. 아래는 제출한 내용입니다.
        </p>
      )}

      {form.questions.length > 0 && (
        <div className="flex flex-col gap-5">
          {form.questions
            .filter((question) => visible.has(question.id))
            .map((question) => (
              <QuestionField
                key={question.id}
                question={question}
                value={answers[question.id]}
                onChange={(value) => setAnswers((prev) => ({ ...prev, [question.id]: value }))}
                disabled={applied || submitting}
              />
            ))}
        </div>
      )}

      {error && <p className="text-[13px] text-signal-err">{error}</p>}

      {applied ? (
        <div className="flex">
          <button
            type="button"
            onClick={handleCancel}
            disabled={submitting}
            className={DUSK_CANCEL_BUTTON}
          >
            {submitting ? '처리 중…' : '신청 취소'}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          <div className="flex">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!form.canApply || submitting || missing.length > 0}
              className={form.canApply ? DUSK_SUBMIT_BUTTON : DUSK_GHOST_BUTTON}
            >
              {submitting ? '처리 중…' : '신청하기'}
            </button>
          </div>
          {!form.canApply && form.blockedReason && (
            <p className="text-[13px] text-dusk-ink-800">{form.blockedReason}</p>
          )}
          {form.canApply && missing.length > 0 && (
            <p className="text-[13px] text-dusk-ink-800">
              필수 항목을 채워주세요 — {missing.map((q) => q.label).join(', ')}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

const readErrorMessage = (error: unknown): string => {
  const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
  return message ?? '처리하지 못했습니다. 잠시 후 다시 시도해주세요.'
}
