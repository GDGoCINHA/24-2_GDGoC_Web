'use client'

import { useCallback, useEffect, useState } from 'react'

import {
  DUSK_GHOST_BUTTON,
  DUSK_INPUT,
  DUSK_LABEL,
  DUSK_PRIMARY_BUTTON,
  DUSK_TEXTAREA
} from '@/components/ui/dusk/DuskForm'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import {
  describeUploadError,
  requestPresignedUpload,
  toPublicUrl,
  uploadFileToS3,
  validateUploadSize
} from '@/services/board/uploadClient'
import { readClubError } from '@/services/club/clubClient'
import {
  fetchClubCompletion,
  saveClubGoal,
  saveRestWeeks,
  shortDate,
  submitClubGoalResult,
  thisMonday,
  weekStateOf
} from '@/services/club/clubCompletionClient'
import {
  CLUB_COMPLETION_STATUS_LABEL,
  CLUB_GOAL_STATUS_LABEL,
  CLUB_WARNING_LABEL,
  type ClubCompletion,
  type ClubMembership,
  type ClubWeekState
} from '@/types/club'
import { cn } from '@/utils/cn'

export const WEEK_LABEL: Record<ClubWeekState, string> = {
  SATISFIED: '충족',
  MISSED: '미충족',
  REST: '쉬는 주',
  PENDING_REVIEW: '검토 중',
  CURRENT: '이번 주',
  UPCOMING: '예정'
}

const WEEK_CLASS: Record<ClubWeekState, string> = {
  SATISFIED: 'bg-[rgba(134,192,143,0.16)] text-signal-ok',
  MISSED: 'bg-[rgba(217,117,106,0.16)] text-signal-err',
  REST: 'border border-dashed border-dusk-line-dashed text-dusk-ink-700',
  PENDING_REVIEW: 'bg-[rgba(224,162,78,0.14)] text-tag-event',
  CURRENT: 'border border-ember text-dusk-ink-100',
  UPCOMING: 'border border-dusk-line-soft text-dusk-ink-800'
}

const LEGEND: ClubWeekState[] = ['SATISFIED', 'MISSED', 'PENDING_REVIEW', 'REST', 'CURRENT']

/** 증빙 파일 업로드 경로. 서버 `S3KeyType.clubGoal`. */
const GOAL_S3_KEY = 'clubGoal'

type Editing = null | 'goal' | 'result' | 'rest'

/** 상세 「목표·완주」 탭 (C 담당). 계산값은 참고용이고, 확정은 운영진이 한다. */
export function ClubCompletionTab({
  clubId,
  myMembership
}: {
  clubId: number
  myMembership: ClubMembership | null
}) {
  const { apiClient } = useAuthenticatedApi()
  const isLeader = Boolean(myMembership?.isLeader)
  const [data, setData] = useState<ClubCompletion | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<Editing>(null)
  const [busy, setBusy] = useState(false)

  const [goal, setGoal] = useState('')
  const [criteria, setCriteria] = useState('')
  const [result, setResult] = useState('')
  const [evidence, setEvidence] = useState<string[]>([])

  const load = useCallback(() => {
    if (!clubId) return
    fetchClubCompletion(apiClient, clubId)
      .then((next) => {
        setData(next)
        setError(null)
      })
      .catch((err) => setError(readClubError(err, '완주 현황을 불러오지 못했어요.')))
  }, [apiClient, clubId])

  useEffect(load, [load])

  const run = async (action: () => Promise<void>) => {
    setBusy(true)
    try {
      await action()
      load()
    } catch (err) {
      window.alert(readClubError(err))
    } finally {
      setBusy(false)
    }
  }

  const openGoal = () => {
    setGoal(data?.goal ?? '')
    setCriteria(data?.goalCriteria ?? '')
    setEditing('goal')
  }
  const openResult = () => {
    setResult(data?.goalResult ?? '')
    setEvidence(data?.goalEvidenceUrls ?? [])
    setEditing('result')
  }

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setBusy(true)
    try {
      const urls: string[] = []
      for (const file of Array.from(files)) {
        const sizeError = validateUploadSize(file)
        if (sizeError) throw new Error(sizeError)
        const { uploadUrl } = await requestPresignedUpload(apiClient, file, GOAL_S3_KEY)
        await uploadFileToS3(uploadUrl, file)
        urls.push(toPublicUrl(uploadUrl))
      }
      setEvidence((prev) => [...prev, ...urls].slice(0, 10))
    } catch (err) {
      window.alert(describeUploadError(err))
    } finally {
      setBusy(false)
    }
  }

  // 쉬는 주는 누를 때마다 바로 저장한다 — 표가 즉시 바뀌어야 리더가 결과를 보고 판단한다.
  const toggleRest = (weekStart: string) => {
    if (!data) return
    const next = data.restWeeks.includes(weekStart)
      ? data.restWeeks.filter((w) => w !== weekStart)
      : [...data.restWeeks, weekStart]
    void run(async () => {
      await saveRestWeeks(apiClient, clubId, next)
    })
  }

  if (error) return <p className="py-16 text-center text-[15px] text-dusk-ink-800">{error}</p>
  if (!data) return <p className="py-16 text-center text-[15px] text-dusk-ink-800">불러오는 중…</p>

  const monday = thisMonday()
  const target = data.weeks.filter((w) => !w.rest)
  const satisfied = target.filter((w) => w.satisfied === true).length
  const reviewing = data.weeks.filter((w) => weekStateOf(w, monday) === 'PENDING_REVIEW').length

  const criteriaRows = [
    {
      label: '매주 활동 1회 이상',
      value: data.period
        ? `${satisfied} / ${target.length}주 충족${reviewing ? ` · ${reviewing}주 검토 중` : ''}`
        : '활동 기간 미설정',
      ok: data.period !== null && satisfied === target.length && target.length > 0
    },
    { label: '팀원 4명 이상', value: `${data.memberCount}명`, ok: data.memberCountSatisfied },
    {
      label: '목표 달성',
      value: CLUB_GOAL_STATUS_LABEL[data.goalStatus],
      ok: data.goalStatus === 'ACHIEVED'
    }
  ]

  return (
    <div className="flex flex-col gap-7">
      {data.warnings.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {data.warnings.map((warning) => (
            <span
              key={warning}
              className="rounded-full bg-[rgba(224,162,78,0.14)] px-2.5 py-[3px] text-xs text-tag-event"
            >
              {CLUB_WARNING_LABEL[warning]}
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4 mobile:grid-cols-1">
        <div className="flex flex-col gap-2 rounded-[20px] border border-dusk-line p-5">
          {editing === 'goal' ? (
            <>
              <label className="flex flex-col gap-1.5">
                <span className={DUSK_LABEL}>팀 목표</span>
                <textarea
                  rows={2}
                  value={goal}
                  maxLength={2000}
                  onChange={(e) => setGoal(e.target.value)}
                  className={DUSK_TEXTAREA}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={DUSK_LABEL}>달성 기준</span>
                <textarea
                  rows={2}
                  value={criteria}
                  maxLength={2000}
                  onChange={(e) => setCriteria(e.target.value)}
                  className={DUSK_TEXTAREA}
                />
              </label>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className={DUSK_GHOST_BUTTON}
                >
                  취소
                </button>
                <button
                  type="button"
                  disabled={busy || goal.trim() === ''}
                  onClick={() =>
                    run(async () => {
                      await saveClubGoal(apiClient, clubId, {
                        goal: goal.trim(),
                        goalCriteria: criteria.trim() || null
                      })
                      setEditing(null)
                    })
                  }
                  className={DUSK_PRIMARY_BUTTON}
                >
                  저장
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-xs text-dusk-ink-800">팀 목표</div>
              <div className="whitespace-pre-line text-base leading-[1.55]">
                {data.goal ?? '아직 등록하지 않았어요'}
              </div>
              <div className="mt-2 text-xs text-dusk-ink-800">달성 기준</div>
              <div className="whitespace-pre-line text-sm leading-[1.55] text-dusk-ink-400">
                {data.goalCriteria ?? '-'}
              </div>
              {data.goalResult && (
                <>
                  <div className="mt-2 text-xs text-dusk-ink-800">최종 결과</div>
                  <div className="whitespace-pre-line text-sm leading-[1.55] text-dusk-ink-400">
                    {data.goalResult}
                  </div>
                  {data.goalEvidenceUrls.length > 0 && (
                    <div className="flex flex-wrap gap-2 text-[13px]">
                      {data.goalEvidenceUrls.map((url, index) => (
                        <a
                          key={url}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-ember underline"
                        >
                          증빙 {index + 1}
                        </a>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
        <div className="flex flex-col gap-3 rounded-[20px] border border-dusk-line p-5">
          <div className="text-xs text-dusk-ink-800">완주 기준</div>
          {criteriaRows.map((row) => (
            <div key={row.label} className="flex justify-between gap-3 text-sm">
              <span className="text-dusk-ink-200">{row.label}</span>
              <span className={row.ok ? 'text-signal-ok' : 'text-tag-event'}>{row.value}</span>
            </div>
          ))}
          <div className="mt-1 flex justify-between border-t border-dusk-line-soft pt-3 text-sm">
            <span className="text-dusk-ink-700">완주 확정</span>
            <span
              className={
                data.completionStatus === 'COMPLETED' ? 'text-signal-ok' : 'text-dusk-ink-400'
              }
            >
              {CLUB_COMPLETION_STATUS_LABEL[data.completionStatus]}
            </span>
          </div>
        </div>
      </div>

      {editing === 'result' && (
        <section className="flex flex-col gap-3 rounded-[20px] border border-dusk-line p-5">
          <label className="flex flex-col gap-1.5">
            <span className={DUSK_LABEL}>최종 결과</span>
            <textarea
              rows={3}
              value={result}
              maxLength={5000}
              onChange={(e) => setResult(e.target.value)}
              className={DUSK_TEXTAREA}
            />
          </label>
          <div className="flex flex-col gap-1.5">
            <span className={DUSK_LABEL}>증빙 파일 (최대 10개, 파일당 10MB)</span>
            <input
              type="file"
              multiple
              disabled={busy || evidence.length >= 10}
              onChange={(e) => {
                void upload(e.target.files)
                e.target.value = ''
              }}
              className={cn(DUSK_INPUT, 'text-sm')}
            />
            {evidence.map((url, index) => (
              <div key={url} className="flex items-center gap-2 text-[13px]">
                <a href={url} target="_blank" rel="noreferrer" className="text-ember underline">
                  증빙 {index + 1}
                </a>
                <button
                  type="button"
                  onClick={() => setEvidence((prev) => prev.filter((u) => u !== url))}
                  className="min-h-9 text-dusk-ink-800"
                >
                  빼기
                </button>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setEditing(null)} className={DUSK_GHOST_BUTTON}>
              취소
            </button>
            <button
              type="button"
              disabled={busy || result.trim() === ''}
              onClick={() =>
                run(async () => {
                  await submitClubGoalResult(apiClient, clubId, {
                    goalResult: result.trim(),
                    evidenceUrls: evidence
                  })
                  setEditing(null)
                })
              }
              className={DUSK_PRIMARY_BUTTON}
            >
              제출
            </button>
          </div>
        </section>
      )}

      <section className="flex flex-col gap-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">
            주차별 활동{' '}
            {data.period && (
              <span className="text-[13px] font-normal text-dusk-ink-800">
                {shortDate(data.period.startDate)} – {shortDate(data.period.endDate)}
              </span>
            )}
          </h2>
          <div className="flex flex-wrap gap-3.5 text-xs text-dusk-ink-700">
            {LEGEND.map((state) => (
              <span key={state} className="inline-flex items-center gap-1.5">
                <span aria-hidden className={cn('size-2.5 rounded-[3px]', WEEK_CLASS[state])} />
                {WEEK_LABEL[state]}
              </span>
            ))}
          </div>
        </div>
        {!data.period ? (
          <p className="text-sm text-dusk-ink-800">
            활동 기간이 정해지지 않아 주차를 계산하지 않았어요.
            {isLeader && ' 소모임 관리에서 활동 기간을 정해 주세요.'}
          </p>
        ) : (
          <>
            {editing === 'rest' && (
              <p className="text-[13px] text-tag-event">
                쉬는 주로 바꿀 주를 누르세요. 누르면 바로 저장돼요.
              </p>
            )}
            <ol className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-2">
              {data.weeks.map((week, index) => {
                const state = weekStateOf(week, monday)
                const counted = week.activities.filter((a) => a.counted).length
                const body = (
                  <>
                    <div className="text-xs opacity-80">{index + 1}주차</div>
                    <div className="mt-0.5 text-[13px]">{shortDate(week.weekStart)}</div>
                    <div className="mt-2 text-xs font-semibold">{WEEK_LABEL[state]}</div>
                    {week.activities.length > 0 && (
                      <div className="mt-0.5 text-[11px] opacity-80">
                        인정 {counted} / 기록 {week.activities.length}
                      </div>
                    )}
                  </>
                )
                return (
                  <li key={week.weekStart}>
                    {editing === 'rest' ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => toggleRest(week.weekStart)}
                        aria-pressed={week.rest}
                        className={cn(
                          'w-full rounded-xl px-3 py-2.5 text-left',
                          WEEK_CLASS[state],
                          'outline-dashed outline-1 outline-offset-2 outline-ember/50'
                        )}
                      >
                        {body}
                      </button>
                    ) : (
                      <div className={cn('rounded-xl px-3 py-2.5', WEEK_CLASS[state])}>{body}</div>
                    )}
                  </li>
                )
              })}
            </ol>
          </>
        )}
        {(data.pendingActivityCount > 0 || data.outOfPeriodActivityCount > 0) && (
          <p className="text-[13px] text-dusk-ink-800">
            {data.pendingActivityCount > 0 && `검토를 기다리는 기록 ${data.pendingActivityCount}건`}
            {data.pendingActivityCount > 0 && data.outOfPeriodActivityCount > 0 && ' · '}
            {data.outOfPeriodActivityCount > 0 &&
              `활동 기간 밖 기록 ${data.outOfPeriodActivityCount}건은 계산에서 빠졌어요`}
          </p>
        )}
        {isLeader && (
          <div className="flex flex-wrap gap-2.5">
            {data.period && (
              <button
                type="button"
                onClick={() => setEditing(editing === 'rest' ? null : 'rest')}
                className={cn(DUSK_GHOST_BUTTON, 'px-4 py-2 text-[13px]')}
              >
                {editing === 'rest' ? '쉬는 주 지정 끝' : '쉬는 주 지정'}
              </button>
            )}
            <button
              type="button"
              onClick={openGoal}
              className={cn(DUSK_GHOST_BUTTON, 'px-4 py-2 text-[13px]')}
            >
              {data.goal ? '목표 수정' : '목표 등록'}
            </button>
            <button
              type="button"
              onClick={openResult}
              className={cn(DUSK_PRIMARY_BUTTON, 'px-4 py-2 text-[13px]')}
            >
              최종 결과 제출
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
