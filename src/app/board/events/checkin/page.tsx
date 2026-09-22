'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import {
  DuskField,
  DUSK_GHOST_BUTTON,
  DUSK_INPUT,
  DUSK_SUBMIT_BUTTON
} from '@/components/ui/dusk/DuskForm'
import { useAuth } from '@/hooks/useAuth'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import { checkIn, checkInAnonymously } from '@/services/eventApplication/eventApplicationClient'
import type { CheckinResult } from '@/types/eventApplication'

type Phase = 'working' | 'identify' | 'done' | 'failed'

/**
 * QR 을 찍은 부원이 도착하는 화면.
 *
 * 행사장에서 폰으로 열리므로 한 손에 들어오는 크기로만 그린다. 결과 한 줄이 전부다.
 *
 * 로그인하지 않은 폰이면 학번·이름을 받아 체크인한다. 로그인 없이 신청한 사람이 있고, 계정이
 * 있어도 행사장에서 로그인부터 하라고 하면 토큰(3분)이 먼저 만료된다.
 */
export default function EventCheckinResultPage() {
  const searchParams = useSearchParams()
  const eventBoardId = Number(searchParams.get('e'))
  const token = searchParams.get('t') ?? ''

  const { user } = useAuth()
  const { apiClient } = useAuthenticatedApi()

  const [phase, setPhase] = useState<Phase>('working')
  const [result, setResult] = useState<CheckinResult | null>(null)
  const [error, setError] = useState<string>('')
  const [studentId, setStudentId] = useState('')
  const [name, setName] = useState('')
  const [sending, setSending] = useState(false)

  // 토큰 하나로 한 번만 부른다. 리렌더마다 다시 찍히면 안 된다.
  const sentRef = useRef(false)

  useEffect(() => {
    if (sentRef.current) return
    if (Number.isNaN(eventBoardId) || token === '') {
      sentRef.current = true
      setPhase('failed')
      setError('QR 주소가 올바르지 않습니다. 화면의 QR 을 다시 찍어주세요.')
      return
    }
    if (!user) {
      setPhase('identify')
      return
    }

    sentRef.current = true
    checkIn(apiClient, eventBoardId, token)
      .then((checked) => {
        setResult(checked)
        setPhase('done')
      })
      .catch((e) => {
        setError(readErrorMessage(e))
        setPhase('failed')
      })
  }, [apiClient, eventBoardId, token, user])

  const handleAnonymousCheckIn = async () => {
    setSending(true)
    setError('')
    try {
      const checked = await checkInAnonymously(eventBoardId, token, studentId, name.trim())
      setResult(checked)
      setPhase('done')
    } catch (e) {
      // 이름 오타가 흔하다. 화면을 넘기지 않고 그 자리에서 다시 적게 한다.
      setError(readErrorMessage(e))
    } finally {
      setSending(false)
    }
  }

  const back = `/board/events/checkin/?e=${eventBoardId}&t=${encodeURIComponent(token)}`

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-7 bg-dusk-base px-6 font-pretendard">
      <div className="flex w-full max-w-[420px] flex-col items-center gap-4 text-center">
        {phase === 'working' && <p className="text-[17px] text-dusk-ink-500">체크인하는 중…</p>}

        {phase === 'identify' && (
          <>
            <h1 className="text-[24px] font-semibold tracking-[-0.03em] text-dusk-ink-100">
              체크인
            </h1>
            <p className="text-[15px] leading-[1.6] text-dusk-ink-500">
              신청할 때 적은 학번과 이름을 입력해 주세요.
            </p>
            <div className="flex w-full flex-col gap-4 text-left">
              <DuskField label="학번">
                <input
                  type="text"
                  inputMode="numeric"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value.replace(/\D/g, ''))}
                  maxLength={8}
                  className={DUSK_INPUT}
                />
              </DuskField>
              <DuskField label="이름">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={50}
                  autoComplete="name"
                  className={DUSK_INPUT}
                />
              </DuskField>
            </div>
            {error && <p className="text-[14px] leading-[1.6] text-signal-err">{error}</p>}
            <div className="flex w-full">
              <button
                type="button"
                onClick={handleAnonymousCheckIn}
                disabled={sending || studentId.length !== 8 || name.trim() === ''}
                className={DUSK_SUBMIT_BUTTON}
              >
                {sending ? '확인 중…' : '체크인'}
              </button>
            </div>
            <Link
              href={`/login?next=${encodeURIComponent(back)}`}
              className="text-[13px] text-dusk-ink-800 underline transition-colors hover:text-dusk-ink-100"
            >
              로그인해서 체크인하기
            </Link>
          </>
        )}

        {phase === 'done' && result && (
          <>
            <p className="text-[14px] text-dusk-ink-800">{result.eventTitle}</p>
            <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-dusk-ink-100">
              {result.alreadyCheckedIn ? '이미 체크인했어요' : '체크인 완료'}
            </h1>
            <p className="text-[15px] text-dusk-ink-500">{formatTime(result.checkedInAt)}</p>
          </>
        )}

        {phase === 'failed' && (
          <>
            <h1 className="text-[24px] font-semibold tracking-[-0.03em] text-dusk-ink-100">
              체크인하지 못했어요
            </h1>
            <p className="text-[15px] leading-[1.6] text-dusk-ink-500">{error}</p>
          </>
        )}
      </div>

      <div className="flex gap-2">
        {!Number.isNaN(eventBoardId) && (
          <Link href={`/board/events/detail/?id=${eventBoardId}`} className={DUSK_GHOST_BUTTON}>
            행사 보기
          </Link>
        )}
        {user && (
          <Link href="/profile/" className={DUSK_GHOST_BUTTON}>
            내 활동
          </Link>
        )}
      </div>
    </main>
  )
}

const formatTime = (iso: string): string => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const readErrorMessage = (error: unknown): string => {
  const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
  return message ?? 'QR 이 만료되었을 수 있습니다. 화면의 QR 을 다시 찍어주세요.'
}
