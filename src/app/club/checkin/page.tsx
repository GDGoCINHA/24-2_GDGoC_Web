'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { DUSK_GHOST_BUTTON, DUSK_PRIMARY_BUTTON } from '@/components/ui/dusk/DuskForm'
import { useAuth } from '@/hooks/useAuth'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import { readClubError } from '@/services/club/clubClient'
import { checkInSchedule } from '@/services/club/scheduleClient'
import type { ClubCheckinResult } from '@/types/club'

type Phase = 'working' | 'login' | 'done' | 'failed'

/**
 * 멤버가 모임의 QR 을 찍으면 도착하는 화면 (B 담당). 폰으로 열리므로 결과 한 줄이 전부다.
 *
 * 소모임은 로그인한 부원만 쓴다. 로그인하지 않았으면 로그인 후 이 주소(토큰 포함)로 돌아오게 한다.
 * 토큰은 3분짜리라 로그인이 길어지면 만료될 수 있다 — 그때는 화면의 QR 을 다시 찍으면 된다.
 */
export default function ClubCheckinPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const { user } = useAuth()
  const { apiClient } = useAuthenticatedApi()

  const [phase, setPhase] = useState<Phase>('working')
  const [result, setResult] = useState<ClubCheckinResult | null>(null)
  const [error, setError] = useState('')

  // 토큰 하나로 한 번만 부른다. 리렌더마다 다시 찍히면 안 된다.
  const sentRef = useRef(false)

  useEffect(() => {
    if (sentRef.current) return
    if (!token) {
      sentRef.current = true
      setError('QR 주소가 올바르지 않아요. 화면의 QR 을 다시 찍어 주세요.')
      setPhase('failed')
      return
    }
    if (!user) {
      setPhase('login')
      return
    }

    sentRef.current = true
    checkInSchedule(apiClient, token)
      .then((checked) => {
        setResult(checked)
        setPhase('done')
      })
      .catch((err) => {
        setError(readClubError(err, 'QR 이 만료됐을 수 있어요. 화면의 QR 을 다시 찍어 주세요.'))
        setPhase('failed')
      })
  }, [apiClient, token, user])

  const back = `/club/checkin/?token=${encodeURIComponent(token)}`

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-7 px-6">
      <div className="flex w-full max-w-[420px] flex-col items-center gap-4 text-center">
        {phase === 'working' && <p className="text-[17px] text-dusk-ink-500">체크인하는 중…</p>}

        {phase === 'login' && (
          <>
            <h1 className="text-[24px] font-semibold tracking-[-0.03em]">체크인</h1>
            <p className="text-[15px] leading-[1.6] text-dusk-ink-500">
              소모임 출석은 로그인한 부원만 할 수 있어요.
            </p>
            <Link href={`/login?next=${encodeURIComponent(back)}`} className={DUSK_PRIMARY_BUTTON}>
              로그인하고 체크인하기
            </Link>
          </>
        )}

        {phase === 'done' && result && (
          <>
            <p className="text-[14px] text-dusk-ink-800">{result.scheduleTitle}</p>
            <h1 className="text-[28px] font-semibold tracking-[-0.03em]">
              {result.alreadyCheckedIn ? '이미 체크인했어요' : '체크인 완료'}
            </h1>
            <p className="text-[15px] text-dusk-ink-500">{formatTime(result.checkedAt)}</p>
            <p className="text-[13px] leading-[1.6] text-dusk-ink-800">
              최종 출석은 리더가 활동 기록을 올릴 때 정해져요.
            </p>
          </>
        )}

        {phase === 'failed' && (
          <>
            <h1 className="text-[24px] font-semibold tracking-[-0.03em]">체크인하지 못했어요</h1>
            <p className="text-[15px] leading-[1.6] text-dusk-ink-500">{error}</p>
          </>
        )}
      </div>

      {result && (
        <Link href={`/club/detail/?id=${result.clubId}`} className={DUSK_GHOST_BUTTON}>
          소모임 보기
        </Link>
      )}
    </main>
  )
}

const formatTime = (iso: string): string => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}
