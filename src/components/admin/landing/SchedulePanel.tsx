'use client'

import type { AxiosInstance } from 'axios'
import { useCallback, useEffect, useState } from 'react'

import {
  DuskField,
  DUSK_CANCEL_BUTTON,
  DUSK_INPUT,
  DUSK_PRIMARY_BUTTON
} from '@/components/ui/dusk/DuskForm'
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
const toLocalInput = (iso: string): string => {
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
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(
    async (next?: RecruitPeriodAdmin) => {
      const result = next ?? (await fetchRecruitPeriod(apiClient, recruitType))
      setPeriod(result)
      setOpenAt(toLocalInput(result.openAt))
      setCloseAt(toLocalInput(result.closeAt))
    },
    [apiClient, recruitType]
  )

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

  const handleSave = async () => {
    if (!openAt || !closeAt) return
    if (new Date(openAt) >= new Date(closeAt)) {
      setError('시작이 마감보다 앞서야 합니다.')
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
        closeAt: toIso(closeAt)
      })
      await load(saved)
      setMessage('저장했습니다. 지원 판정에 바로 반영됩니다.')
    } catch {
      setError('저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleClear = async () => {
    if (!window.confirm('저장한 기간을 지우고 서버 설정값으로 되돌립니다. 계속할까요?')) return

    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      const restored = await clearRecruitPeriod(apiClient, recruitType)
      await load(restored)
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
            <DuskField label="시작">
              <input
                type="datetime-local"
                value={openAt}
                onChange={(event) => setOpenAt(event.target.value)}
                className={`${DUSK_INPUT} [color-scheme:dark]`}
              />
            </DuskField>
            <DuskField label="마감">
              <input
                type="datetime-local"
                value={closeAt}
                onChange={(event) => setCloseAt(event.target.value)}
                className={`${DUSK_INPUT} [color-scheme:dark]`}
              />
            </DuskField>
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
 * 모집 기간.
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
