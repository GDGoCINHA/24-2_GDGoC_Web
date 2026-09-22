'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import EventApplicationSection from '@/components/eventApplication/EventApplicationSection'
import { fetchEventDetail } from '@/services/board/boardClient'
import type { EventBoardDetail } from '@/types/board'
import { formatDate } from '@/utils/formatDate'

/**
 * 신청 폼만 있는 화면. 운영진이 링크로 뿌리는 주소다.
 *
 * 행사 상세로 보내면 본문을 한참 내려야 신청칸이 나오고, 사이트 헤더의 메뉴가 발길을 돌린다.
 * 링크를 타고 온 사람에게는 행사명과 폼만 보여준다. 폼을 로그인 없이 받게 해 두면 가입 없이
 * 바로 낼 수 있다(폼 빌더의 「신청 자격」).
 */
export default function EventApplyPage() {
  const searchParams = useSearchParams()
  const idParam = searchParams.get('id')
  const id = idParam ? Number(idParam) : NaN

  const [detail, setDetail] = useState<EventBoardDetail | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!Number.isFinite(id)) {
      setFailed(true)
      return
    }
    let alive = true
    fetchEventDetail(id)
      .then((data) => {
        if (alive) setDetail(data)
      })
      .catch(() => {
        if (alive) setFailed(true)
      })
    return () => {
      alive = false
    }
  }, [id])

  return (
    <main className="min-h-screen bg-dusk-base font-pretendard">
      <div className="mx-auto flex w-full max-w-[640px] flex-col gap-6 px-[clamp(20px,5vw,32px)] pb-24 pt-12">
        <p className="text-[13px] tracking-[0.06em] text-dusk-ink-800">GDGoC INHA 행사 신청</p>

        {failed && (
          <p className="text-base text-dusk-ink-600">
            행사를 찾을 수 없습니다. 링크를 다시 확인해 주세요.
          </p>
        )}

        {detail && (
          <>
            <div className="flex flex-col gap-2">
              <h1 className="break-keep text-[clamp(24px,3vw,32px)] font-semibold leading-[1.3] tracking-[-0.03em] text-dusk-ink-100">
                {detail.title}
              </h1>
              <p className="text-[13px] text-dusk-ink-800">
                {formatDate(detail.eventStartDate)} ~ {formatDate(detail.eventEndDate)}
              </p>
            </div>

            <EventApplicationSection
              eventBoardId={detail.id}
              fallback={
                <p className="border-t border-t-[rgba(240,234,228,0.10)] pt-7 text-sm text-dusk-ink-500">
                  이 행사는 지금 신청을 받고 있지 않습니다.
                </p>
              }
            />

            <Link
              href={`/board/events/detail/?id=${detail.id}`}
              className="self-start text-[13px] text-dusk-ink-800 underline transition-colors hover:text-dusk-ink-100"
            >
              행사 자세히 보기
            </Link>
          </>
        )}
      </div>
    </main>
  )
}
