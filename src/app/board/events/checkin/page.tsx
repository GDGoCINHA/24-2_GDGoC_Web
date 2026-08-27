'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { DUSK_GHOST_BUTTON } from '@/components/ui/dusk/DuskForm'
import { useAuth } from '@/hooks/useAuth'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import { checkIn } from '@/services/eventApplication/eventApplicationClient'
import type { CheckinResult } from '@/types/eventApplication'

type Phase = 'working' | 'done' | 'failed'

/**
 * QR 을 찍은 부원이 도착하는 화면.
 *
 * 행사장에서 폰으로 열리므로 한 손에 들어오는 크기로만 그린다. 결과 한 줄이 전부다.
 */
export default function EventCheckinResultPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const eventBoardId = Number(searchParams.get('e'))
  const token = searchParams.get('t') ?? ''

  const { user } = useAuth()
  const { apiClient } = useAuthenticatedApi()

  const [phase, setPhase] = useState<Phase>('working')
  const [result, setResult] = useState<CheckinResult | null>(null)
  const [error, setError] = useState<string>('')

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
      // 로그인 뒤 이 주소로 그대로 돌아온다. 다만 토큰이 1분짜리라 만료될 수 있다.
      const back = `/board/events/checkin/?e=${eventBoardId}&t=${encodeURIComponent(token)}`
      router.replace(`/login?next=${encodeURIComponent(back)}`)
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
  }, [apiClient, eventBoardId, token, user, router])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-7 bg-dusk-base px-6 font-pretendard">
      <div className="flex w-full max-w-[420px] flex-col items-center gap-4 text-center">
        {phase === 'working' && <p className="text-[17px] text-dusk-ink-500">체크인하는 중…</p>}

        {phase === 'done' && result && (
          <>
            <p className="text-[14px] text-dusk-ink-800">
              {result.eventTitle}
            </p>
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
        <Link href="/profile/" className={DUSK_GHOST_BUTTON}>
          내 활동
        </Link>
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
