'use client'

import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import {
  ADMIN_CONTAINER,
  ADMIN_ERROR_BANNER,
  ADMIN_GHOST_BUTTON,
  ADMIN_PAGE
} from '@/components/admin/dashboard/adminStyles'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import {
  fetchApplicants,
  fetchCheckinToken,
  fetchEventForm
} from '@/services/eventApplication/eventApplicationClient'

/**
 * 행사장에 띄우는 체크인 QR.
 *
 * 부원은 각자 폰의 기본 카메라로 찍는다. 토큰이 1분마다 바뀌므로 화면을 찍어 나중에
 * 쓰거나 단톡방에 뿌려도 소용이 없다.
 */

/** 한 번에 세는 신청자 수. 동아리 행사 규모에서 한 페이지면 충분하다. */
const COUNT_PAGE_SIZE = 500

export default function EventCheckinDisplayPage() {
  const searchParams = useSearchParams()
  const idParam = searchParams.get('id')
  const eventBoardId = idParam ? Number(idParam) : NaN

  const { apiClient } = useAuthenticatedApi()

  const [title, setTitle] = useState('')
  const [svg, setSvg] = useState('')
  const [url, setUrl] = useState('')
  const [remaining, setRemaining] = useState(0)
  const [counts, setCounts] = useState<{ checkedIn: number; applied: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refreshToken = useCallback(async () => {
    try {
      const issued = await fetchCheckinToken(apiClient, eventBoardId)
      const target = `${window.location.origin}/board/events/checkin/?e=${eventBoardId}&t=${encodeURIComponent(issued.token)}`
      setUrl(target)
      setSvg(await renderQr(target))
      setRemaining(issued.expiresInSeconds)
      setError(null)
    } catch (e) {
      setError(readErrorMessage(e))
    }
  }, [apiClient, eventBoardId])

  const refreshCounts = useCallback(async () => {
    try {
      const paged = await fetchApplicants(apiClient, eventBoardId, {
        page: 0,
        size: COUNT_PAGE_SIZE,
        status: 'APPLIED'
      })
      setCounts({
        checkedIn: paged.items.filter((applicant) => applicant.checkedInAt != null).length,
        applied: paged.meta.totalElements
      })
    } catch {
      // 카운트는 곁다리다. 실패해도 QR 을 계속 띄운다.
    }
  }, [apiClient, eventBoardId])

  useEffect(() => {
    if (Number.isNaN(eventBoardId)) return
    void fetchEventForm(apiClient, eventBoardId)
      .then((form) => setTitle(form.eventTitle))
      .catch(() => setTitle(''))
  }, [apiClient, eventBoardId])

  useEffect(() => {
    const timer = setInterval(() => setRemaining((prev) => (prev <= 0 ? 0 : prev - 1)), 1000)
    return () => clearInterval(timer)
  }, [])

  // 남은 시간이 0 이면 새 토큰을 받아 다시 그린다. 첫 발급도 여기서 일어난다.
  // 발급이 실패하면 remaining 이 0 에 머물러 이 훅이 다시 돌지 않는다 — 재시도 폭주를 막는다.
  useEffect(() => {
    if (Number.isNaN(eventBoardId) || remaining > 0) return
    void refreshToken()
    void refreshCounts()
  }, [eventBoardId, remaining, refreshToken, refreshCounts])

  if (Number.isNaN(eventBoardId)) {
    return (
      <main className={ADMIN_PAGE}>
        <section className={`${ADMIN_CONTAINER} pt-10`}>
          <p className={ADMIN_ERROR_BANNER}>행사를 찾을 수 없습니다. 주소를 확인해주세요.</p>
        </section>
      </main>
    )
  }

  return (
    <main className={`${ADMIN_PAGE} flex min-h-screen flex-col items-center justify-center gap-5`}>
      <div className="flex flex-col items-center gap-1.5 text-center">
        <p className="text-[13px] uppercase tracking-[0.14em] text-admin-ink-dim">체크인</p>
        <h1 className="text-[clamp(20px,3vw,34px)] font-semibold tracking-[-0.03em]">
          {title || '행사 체크인'}
        </h1>
        <p className="text-[15px] text-admin-ink-muted">폰 카메라로 QR 을 찍어주세요.</p>
      </div>

      {/* QR 은 밝은 바닥 위에 있어야 인식된다. 어두운 관리자 화면에서도 이 판만 희게 둔다. */}
      <div
        className="w-[min(58vw,46vh)] rounded-[24px] bg-admin-pure p-[clamp(14px,1.6vw,24px)]"
        dangerouslySetInnerHTML={{ __html: svg }}
      />

      <div className="flex flex-col items-center gap-2">
        <p className="text-[15px] tabular-nums text-admin-ink-muted">
          {formatRemaining(remaining)} 뒤 새 QR 로 바뀝니다
        </p>
        {counts && (
          <p className="text-[clamp(16px,2vw,22px)] tabular-nums text-admin-ink">
            체크인 {counts.checkedIn}명 / 신청 {counts.applied}명
          </p>
        )}
        <div className="mt-2 flex gap-2">
          <button type="button" className={ADMIN_GHOST_BUTTON} onClick={refreshToken}>
            QR 새로 받기
          </button>
          <a
            href={`/dashboard/events/applicants/?id=${eventBoardId}`}
            className={ADMIN_GHOST_BUTTON}
          >
            신청자 목록
          </a>
        </div>
        {/* QR 이 안 읽히는 폰이 늘 한둘 있다. 주소를 직접 부를 수 있게 남겨둔다. */}
        {url && <p className="max-w-[90vw] break-all text-[11px] text-admin-ink-faint">{url}</p>}
      </div>

      {error && (
        <div className={ADMIN_CONTAINER}>
          <p className={ADMIN_ERROR_BANNER}>{error}</p>
        </div>
      )}
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

const readErrorMessage = (error: unknown): string => {
  const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
  return message ?? 'QR 을 받지 못했습니다. 잠시 후 다시 시도해주세요.'
}

/**
 * 남은 시간 표기. 창이 3분이라 초로만 적으면 "173초 뒤" 처럼 읽기 어렵다.
 */
const formatRemaining = (seconds: number): string => {
  if (seconds < 60) return `${seconds}초`
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return rest === 0 ? `${minutes}분` : `${minutes}분 ${rest}초`
}
