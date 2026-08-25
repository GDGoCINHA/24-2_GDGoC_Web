'use client'

import type { AxiosInstance } from 'axios'
import { useEffect, useState } from 'react'

import {
  DuskField,
  DUSK_CANCEL_BUTTON,
  DUSK_INPUT,
  DUSK_PRIMARY_BUTTON,
  DUSK_TEXTAREA
} from '@/components/ui/dusk/DuskForm'
import type { RecruitScheduleNotice } from '@/constant/recruitSchedule'
import {
  clearRecruitPeriod,
  fetchRecruitPeriod,
  updateRecruitPeriod
} from '@/services/landing/landingClient'
import type { RecruitPeriodAdmin, RecruitType } from '@/types/landing.admin'

/**
 * `datetime-local` 은 시간대 없는 문자열을 다룬다. 서버는 Instant(UTC)를 주고받으므로
 * 브라우저 시간대 기준으로 서로 바꾼다 — 운영진이 한국에서 쓰는 값이라 KST 로 읽힌다.
 */
const toLocalInput = (iso: string | null | undefined): string => {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const toIso = (local: string): string => new Date(local).toISOString()

const TYPE_LABEL: Record<RecruitType, string> = {
  CORE: '운영진(Core) 모집',
  MEMBER: '부원 모집'
}

/**
 * 안내 일정 입력칸. 전부 문자열로 들고 있다가 저장할 때만 ISO 로 바꾼다.
 *
 * 비어 있는 칸은 비운 채로 저장한다 — 지웠다는 뜻이라, 예전 값을 남겨두면 화면에서 지운
 * 날짜가 계속 보인다. 비면 방문자 화면은 배포에 들어 있는 기본값을 그린다.
 */
type NoticeForm = {
  documentResultAt: string
  interviewOpenAt: string
  interviewCloseAt: string
  finalResultAt: string
  interviewNote: string
  meetingNote: string
  intensiveOpenAt: string
  intensiveCloseAt: string
}

const EMPTY_NOTICE: NoticeForm = {
  documentResultAt: '',
  interviewOpenAt: '',
  interviewCloseAt: '',
  finalResultAt: '',
  interviewNote: '',
  meetingNote: '',
  intensiveOpenAt: '',
  intensiveCloseAt: ''
}

const toNoticeForm = (notice: RecruitScheduleNotice | null | undefined): NoticeForm => ({
  documentResultAt: toLocalInput(notice?.documentResultAt),
  interviewOpenAt: toLocalInput(notice?.interviewOpenAt),
  interviewCloseAt: toLocalInput(notice?.interviewCloseAt),
  finalResultAt: toLocalInput(notice?.finalResultAt),
  interviewNote: notice?.interviewNote ?? '',
  meetingNote: notice?.meetingNote ?? '',
  intensiveOpenAt: toLocalInput(notice?.intensiveOpenAt),
  intensiveCloseAt: toLocalInput(notice?.intensiveCloseAt)
})

const toNoticePayload = (form: NoticeForm): RecruitScheduleNotice => ({
  documentResultAt: form.documentResultAt ? toIso(form.documentResultAt) : null,
  interviewOpenAt: form.interviewOpenAt ? toIso(form.interviewOpenAt) : null,
  interviewCloseAt: form.interviewCloseAt ? toIso(form.interviewCloseAt) : null,
  finalResultAt: form.finalResultAt ? toIso(form.finalResultAt) : null,
  interviewNote: form.interviewNote.trim() || null,
  meetingNote: form.meetingNote.trim() || null,
  intensiveOpenAt: form.intensiveOpenAt ? toIso(form.intensiveOpenAt) : null,
  intensiveCloseAt: form.intensiveCloseAt ? toIso(form.intensiveCloseAt) : null
})

/** 둘 다 채웠는데 거꾸로면 막는다. 한쪽만 채운 상태는 서버도 허용한다. */
const reversed = (openAt: string, closeAt: string): boolean =>
  Boolean(openAt) && Boolean(closeAt) && new Date(openAt) >= new Date(closeAt)

function DateField({
  label,
  hint,
  value,
  onChange
}: {
  label: string
  hint?: string
  value: string
  onChange: (next: string) => void
}) {
  return (
    <DuskField label={label} hint={hint}>
      <input
        type="datetime-local"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${DUSK_INPUT} [color-scheme:dark]`}
      />
    </DuskField>
  )
}

function NoteField({
  label,
  hint,
  value,
  onChange
}: {
  label: string
  hint: string
  value: string
  onChange: (next: string) => void
}) {
  return (
    <DuskField label={label} hint={hint}>
      <textarea
        rows={2}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={DUSK_TEXTAREA}
      />
    </DuskField>
  )
}

function PeriodEditor({
  recruitType,
  apiClient
}: {
  recruitType: RecruitType
  apiClient: AxiosInstance
}) {
  const [period, setPeriod] = useState<RecruitPeriodAdmin | null>(null)
  const [openAt, setOpenAt] = useState('')
  const [closeAt, setCloseAt] = useState('')
  const [notice, setNotice] = useState<NoticeForm>(EMPTY_NOTICE)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const apply = (result: RecruitPeriodAdmin) => {
    setPeriod(result)
    setOpenAt(toLocalInput(result.openAt))
    setCloseAt(toLocalInput(result.closeAt))
    setNotice(toNoticeForm(result.notice))
  }

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)

    fetchRecruitPeriod(apiClient, recruitType)
      .then((result) => {
        if (!alive) return
        setPeriod(result)
        setOpenAt(toLocalInput(result.openAt))
        setCloseAt(toLocalInput(result.closeAt))
        setNotice(toNoticeForm(result.notice))
      })
      .catch(() => {
        if (alive) setError('모집 기간을 불러오지 못했습니다.')
      })
      .finally(() => {
        if (alive) setLoading(false)
      })

    return () => {
      alive = false
    }
  }, [apiClient, recruitType])

  const patchNotice = (next: Partial<NoticeForm>) => setNotice({ ...notice, ...next })

  const handleSave = async () => {
    if (!openAt || !closeAt) return
    if (new Date(openAt) >= new Date(closeAt)) {
      setError('시작이 마감보다 앞서야 합니다.')
      return
    }
    if (reversed(notice.interviewOpenAt, notice.interviewCloseAt)) {
      setError('면접 시작이 마감보다 앞서야 합니다.')
      return
    }
    if (reversed(notice.intensiveOpenAt, notice.intensiveCloseAt)) {
      setError('집중 모집 시작이 마감보다 앞서야 합니다.')
      return
    }
    // 지원 창구를 실제로 여닫는 값이다. 잘못 누르면 지원이 바로 닫히거나 엉뚱한 때 열린다.
    if (
      !window.confirm(
        `${TYPE_LABEL[recruitType]} 기간을 바꿉니다.\n\n이 값으로 지원 버튼이 열리고 닫힙니다. 계속할까요?`
      )
    ) {
      return
    }

    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      const saved = await updateRecruitPeriod(apiClient, recruitType, {
        openAt: toIso(openAt),
        closeAt: toIso(closeAt),
        ...toNoticePayload(notice)
      })
      apply(saved)
      setMessage('저장했습니다. 지원 판정과 안내 문구에 바로 반영됩니다.')
    } catch {
      setError('저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleClear = async () => {
    // 되돌리기는 행을 통째로 지운다. 기간만 되돌아가는 것으로 읽히면 발표 날짜가
    // 사라진 걸 나중에야 알게 되므로 여기서 미리 말한다.
    if (
      !window.confirm(
        '저장한 기간을 지우고 서버 설정값으로 되돌립니다.\n\n아래 안내 일정도 함께 지워지고, 방문자 화면은 배포에 들어 있는 기본값으로 돌아갑니다. 계속할까요?'
      )
    ) {
      return
    }

    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      const restored = await clearRecruitPeriod(apiClient, recruitType)
      apply(restored)
      setMessage('서버 설정값으로 되돌렸습니다.')
    } catch {
      setError('되돌리지 못했습니다.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="flex flex-col gap-4 rounded-[14px] border border-[rgba(240,234,228,0.12)] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[17px] font-semibold tracking-[-0.02em]">{TYPE_LABEL[recruitType]}</h2>
        {period && (
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] ${
              period.overridden
                ? 'bg-[rgba(208,129,85,0.18)] text-ember'
                : 'bg-[rgba(240,234,228,0.10)] text-dusk-ink-500'
            }`}
          >
            {period.overridden ? '여기서 저장한 값' : '서버 설정값'}
          </span>
        )}
      </div>

      {loading ? (
        <p className="text-[15px] text-dusk-ink-800">불러오는 중...</p>
      ) : (
        <>
          <div className="grid gap-[18px] [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
            <DateField label="시작" value={openAt} onChange={setOpenAt} />
            <DateField label="마감" value={closeAt} onChange={setCloseAt} />
          </div>

          {/* 아래부터는 화면에 보이기만 하는 값이다. 위 두 칸과 섞이면 지원이 열린 줄 알고
              발표 날짜를 지웠다가 창구를 닫아버리는 사고가 난다. */}
          <div className="mt-2 flex flex-col gap-[18px] border-t border-t-[rgba(240,234,228,0.12)] pt-5">
            <p className="text-[13px] leading-[1.7] text-dusk-ink-700">
              아래는 안내 문구입니다. 지원 버튼을 여닫지 않습니다. 비워 두면 배포에 들어 있는
              기본값이 그대로 보입니다.
            </p>

            {recruitType === 'CORE' ? (
              <>
                <div className="grid gap-[18px] [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
                  <DateField
                    label="서류 발표"
                    hint="자정으로 두면 시각은 안 보인다."
                    value={notice.documentResultAt}
                    onChange={(documentResultAt) => patchNotice({ documentResultAt })}
                  />
                  <DateField
                    label="최종 발표"
                    value={notice.finalResultAt}
                    onChange={(finalResultAt) => patchNotice({ finalResultAt })}
                  />
                  <DateField
                    label="면접 시작"
                    value={notice.interviewOpenAt}
                    onChange={(interviewOpenAt) => patchNotice({ interviewOpenAt })}
                  />
                  <DateField
                    label="면접 마감"
                    value={notice.interviewCloseAt}
                    onChange={(interviewCloseAt) => patchNotice({ interviewCloseAt })}
                  />
                </div>
                <NoteField
                  label="면접 안내 문구"
                  hint="앞의 ※ 는 화면이 붙인다. 직접 적지 않는다."
                  value={notice.interviewNote}
                  onChange={(interviewNote) => patchNotice({ interviewNote })}
                />
                <NoteField
                  label="활동 안내 문구"
                  hint="지원 안내의 운영진 회의 안내 아래에 붙는다."
                  value={notice.meetingNote}
                  onChange={(meetingNote) => patchNotice({ meetingNote })}
                />
              </>
            ) : (
              <div className="grid gap-[18px] [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
                <DateField
                  label="집중 모집 시작"
                  hint="상시 모집과 별개로 안내만 하는 기간이다."
                  value={notice.intensiveOpenAt}
                  onChange={(intensiveOpenAt) => patchNotice({ intensiveOpenAt })}
                />
                <DateField
                  label="집중 모집 마감"
                  value={notice.intensiveCloseAt}
                  onChange={(intensiveCloseAt) => patchNotice({ intensiveCloseAt })}
                />
              </div>
            )}
          </div>

          {message && <p className="text-[13px] text-signal-ok">{message}</p>}
          {error && <p className="text-[13px] text-signal-err">{error}</p>}

          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className={DUSK_PRIMARY_BUTTON}
            >
              {saving ? '저장 중...' : '기간 저장'}
            </button>
            {period?.overridden && (
              <button
                type="button"
                onClick={handleClear}
                disabled={saving}
                className={`${DUSK_CANCEL_BUTTON} py-3 text-sm`}
              >
                설정값으로 되돌리기
              </button>
            )}
          </div>
        </>
      )}
    </section>
  )
}

/**
 * 모집 일정.
 *
 * 다른 탭과 달리 초안·발행을 거치지 않는다. 저장하는 즉시 지원 판정이 이 값을 본다 —
 * 발행을 기다리는 동안 화면 문구와 실제 동작이 갈라지면 그게 더 위험하다.
 */
export function SchedulePanel({ apiClient }: { apiClient: AxiosInstance }) {
  return (
    <div className="flex flex-col gap-7">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.02em]">모집 일정</h1>
        <p className="mt-2.5 text-[15px] leading-[1.7] text-dusk-ink-600">
          여기서 바꾼 기간으로 지원 버튼이 열리고 닫힙니다. 화면 문구만 바뀌는 것이 아닙니다.
        </p>
      </div>

      <p className="rounded-[14px] border border-[rgba(224,162,78,0.35)] bg-[rgba(224,162,78,0.08)] px-5 py-4 text-sm leading-[1.7] text-[#E9C48A]">
        이 탭은 저장하는 즉시 반영됩니다. 아래쪽 &lsquo;발행&rsquo; 과 무관합니다.
      </p>

      <PeriodEditor recruitType="CORE" apiClient={apiClient} />
      <PeriodEditor recruitType="MEMBER" apiClient={apiClient} />
    </div>
  )
}
