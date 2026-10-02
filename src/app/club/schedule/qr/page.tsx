'use client'

import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { formatScheduleTime } from '@/components/club/clubDate'
import { ClubBackLink } from '@/components/club/ClubUi'
import { DUSK_GHOST_BUTTON } from '@/components/ui/dusk/DuskForm'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import { readClubError } from '@/services/club/clubClient'
import { fetchCheckinToken, fetchSchedules } from '@/services/club/scheduleClient'

/**
 * 모임에서 리더가 띄우는 체크인 QR (B 담당). 행사 체크인 QR(`/dashboard/events/checkin`)과 같은 방식이다.
 *
 * 멤버는 각자 폰의 기본 카메라로 찍는다. 토큰이 3분마다 바뀌므로 화면을 찍어 단톡방에 뿌려도 곧 무효가 된다.
 * 체크인은 활동 기록 작성 화면에서 출석 체크의 기본값으로만 쓰인다 — 최종 출석은 리더가 정한다.
 */
export default function ClubScheduleQrPage() {
  const searchParams = useSearchParams()
  const clubId = Number(searchParams.get('clubId') ?? 0)
  const scheduleId = Number(searchParams.get('id') ?? 0)
  const { apiClient } = useAuthenticatedApi()

  const [title, setTitle] = useState('')
  const [svg, setSvg] = useState('')
  const [url, setUrl] = useState('')
  const [remaining, setRemaining] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const refreshToken = useCallback(async () => {
    try {
      const issued = await fetchCheckinToken(apiClient, scheduleId)
      const target = `${window.location.origin}/club/checkin/?token=${encodeURIComponent(issued.token)}`
      setUrl(target)
      setSvg(await renderQr(target))
      setRemaining(issued.expiresInSeconds)
      setError(null)
    } catch (err) {
      setError(readClubError(err, 'QR 을 만들지 못했어요. 이 소모임의 리더만 띄울 수 있어요.'))
    }
  }, [apiClient, scheduleId])

  useEffect(() => {
    if (!clubId || !scheduleId) return
    fetchSchedules(apiClient, clubId, 'upcoming')
      .then((schedules) => {
        const found = schedules.find((schedule) => schedule.id === scheduleId)
        if (found) setTitle(`${formatScheduleTime(found.startsAt)} · ${found.title}`)
      })
      .catch(() => setTitle(''))
  }, [apiClient, clubId, scheduleId])

  useEffect(() => {
    const timer = setInterval(() => setRemaining((prev) => (prev <= 0 ? 0 : prev - 1)), 1000)
    return () => clearInterval(timer)
  }, [])

  // 남은 시간이 0 이면 새 토큰을 받아 다시 그린다. 첫 발급도 여기서 일어난다.
  // 발급이 실패하면 remaining 이 0 에 머물러 이 훅이 다시 돌지 않는다 — 재시도 폭주를 막는다.
  useEffect(() => {
    if (!scheduleId || remaining > 0) return
    void refreshToken()
  }, [scheduleId, remaining, refreshToken])

  if (!scheduleId) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <p className="text-[15px] text-dusk-ink-800">
          일정을 찾을 수 없어요. 주소를 확인해 주세요.
        </p>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-5 px-6 py-10">
      <div className="self-start">
        <ClubBackLink href={`/club/detail/?id=${clubId}`} label="소모임으로" />
      </div>
      <div className="flex flex-col items-center gap-1.5 text-center">
        <p className="text-[13px] tracking-[0.14em] text-dusk-ink-800">출석 체크</p>
        <h1 className="text-[clamp(20px,3vw,32px)] font-semibold tracking-[-0.03em]">
          {title || '모임 체크인'}
        </h1>
        <p className="text-[15px] text-dusk-ink-500">폰 카메라로 QR 을 찍어 주세요.</p>
      </div>

      {/* QR 은 밝은 바닥 위에 있어야 인식된다. 어두운 화면에서도 이 판만 희게 둔다. */}
      <div
        className="w-[min(78vw,46vh)] rounded-[24px] bg-white p-[clamp(14px,1.6vw,24px)]"
        dangerouslySetInnerHTML={{ __html: svg }}
      />

      <div className="flex flex-col items-center gap-2">
        <p className="text-[15px] tabular-nums text-dusk-ink-500">
          {formatRemaining(remaining)} 뒤 새 QR 로 바뀌어요
        </p>
        <button type="button" className={DUSK_GHOST_BUTTON} onClick={() => void refreshToken()}>
          QR 새로 받기
        </button>
        {/* QR 이 안 읽히는 폰이 늘 한둘 있다. 주소를 직접 부를 수 있게 남겨둔다. */}
        {url && <p className="max-w-[90vw] break-all text-[11px] text-dusk-ink-800">{url}</p>}
      </div>

      {error && <p className="text-sm text-signal-err">{error}</p>}
    </main>
  )
}

/**
 * QR 을 SVG 문자열로 만든다.
 *
 * 정적 export 라 빌드 때 서버가 없다 — qrcode-generator 는 브라우저에서만 부른다.
 */
const renderQr = async (text: string): Promise<string> => {
  const qrcode = (await import('qrcode-generator')).default
  // 0 = 데이터 길이에 맞춰 버전 자동 선택. M 은 인쇄물이 아닌 화면용으로 충분하다.
  const qr = qrcode(0, 'M')
  qr.addData(text)
  qr.make()
  return qr.createSvgTag({ scalable: true })
}

const formatRemaining = (seconds: number): string => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}분 ${String(s).padStart(2, '0')}초` : `${s}초`
}
