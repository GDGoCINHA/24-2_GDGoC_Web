'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { ClubSiteHeader } from '@/components/club/ClubSiteHeader'
import { ClubActivityStatusTag, ClubBackLink, KakaoShareButton } from '@/components/club/ClubUi'
import { DUSK_GHOST_BUTTON } from '@/components/ui/dusk/DuskForm'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import { fetchActivity } from '@/services/club/activityClient'
import { readClubError } from '@/services/club/clubClient'
import type { ClubActivityDetail } from '@/types/club'
import { cn } from '@/utils/cn'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

/** 2026-10-07 → 2026.10.07 (수). 활동일은 날짜만 있으므로 시간대 변환 없이 읽는다. */
const formatActivityDate = (date: string) => {
  const [y, m, d] = date.split('-').map(Number)
  const weekday = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]
  return `${date.replaceAll('-', '.')} (${weekday})`
}

/**
 * 활동 기록 상세 (B 담당).
 *
 * 출석 명단과 보완 사유는 서버가 팀 멤버·운영진에게만 채워 준다. 나머지 부원에게는 인원 수만 보인다.
 */
export default function ClubActivityPage() {
  const searchParams = useSearchParams()
  const clubId = Number(searchParams.get('clubId') ?? 0)
  const activityId = Number(searchParams.get('id') ?? 0)
  const { apiClient } = useAuthenticatedApi()
  const [activity, setActivity] = useState<ClubActivityDetail | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!clubId || !activityId) {
      setError('잘못된 주소예요.')
      return
    }
    fetchActivity(apiClient, clubId, activityId)
      .then((data) => {
        setActivity(data)
        setError(null)
      })
      .catch((err) => setError(readClubError(err, '활동 기록을 불러오지 못했어요.')))
  }, [apiClient, clubId, activityId])

  if (error || !activity) {
    return (
      <main className="min-h-screen">
        <ClubSiteHeader />
        <p className="py-24 text-center text-[15px] text-dusk-ink-800">{error ?? '불러오는 중…'}</p>
      </main>
    )
  }

  const satisfied = activity.attendedCount >= activity.requiredCount

  return (
    <main className="min-h-screen">
      <ClubSiteHeader />
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-7 px-[clamp(20px,5vw,44px)] pb-28 pt-11 mobile:pt-6">
        <ClubBackLink href={`/club/detail/?id=${clubId}`} label="소모임으로" />

        <header className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <ClubActivityStatusTag status={activity.status} />
            {activity.scheduleId && (
              <span className="text-[13px] text-dusk-ink-800">일정 연결됨</span>
            )}
          </div>
          <h1 className="text-[clamp(25px,3vw,36px)] font-semibold leading-[1.3] tracking-[-0.03em]">
            {formatActivityDate(activity.activityDate)} 활동
          </h1>
          <div className="flex flex-wrap items-center gap-2.5">
            {activity.editable && (
              <Link
                href={`/club/activity/edit/?clubId=${clubId}&id=${activity.id}`}
                className={DUSK_GHOST_BUTTON}
              >
                {activity.status === 'REVISION_REQUESTED' ? '보완해서 다시 제출' : '수정하기'}
              </Link>
            )}
            {/* TODO(C): 활동일·대표 사진·기록 링크를 공유한다(기획 2.10). */}
            <KakaoShareButton />
          </div>
        </header>

        {activity.status === 'REVISION_REQUESTED' && activity.revisionReason && (
          <div className="flex flex-col gap-1.5 rounded-[14px] border border-[rgba(217,117,106,0.45)] bg-[rgba(217,117,106,0.08)] px-[18px] py-4">
            <div className="text-sm font-semibold text-signal-err">운영진 보완 요청</div>
            <div className="whitespace-pre-line text-sm leading-[1.6] text-dusk-ink-200">
              {activity.revisionReason}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 mobile:grid-cols-1">
          {activity.photoUrls.map((url, index) => (
            <div
              key={url}
              className={cn(
                'aspect-[4/3] overflow-hidden rounded-[14px] bg-dusk-slot',
                activity.photoUrls.length === 1 && 'col-span-2 mobile:col-span-1'
              )}
            >
              {/* next/image 는 못 쓴다 — S3 호스트를 remotePatterns 에 적을 수 없다. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`활동 사진 ${index + 1}`}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>

        <section className="flex flex-col gap-2.5">
          <h2 className="text-lg font-semibold">활동 내용</h2>
          <p className="whitespace-pre-line text-[15px] leading-[1.75] text-dusk-ink-400">
            {activity.content}
          </p>
          {activity.progressNote && (
            <p className="text-sm text-dusk-ink-700">목표 진행: {activity.progressNote}</p>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-lg font-semibold">참석</h2>
            <span className={cn('text-[13px]', satisfied ? 'text-signal-ok' : 'text-tag-event')}>
              {activity.attendedCount} / {activity.rosterCount}명 · 필요 {activity.requiredCount}명{' '}
              {satisfied ? '충족' : '미달'}
            </span>
          </div>
          {activity.attendance ? (
            <ul className="overflow-hidden rounded-[14px] border border-dusk-line">
              {activity.attendance.map((row) => (
                <li
                  key={row.userId}
                  className="flex min-h-12 items-center gap-3 border-b border-dusk-line-soft px-4 py-3 last:border-b-0"
                >
                  <span className="text-[15px]">{row.name}</span>
                  <span
                    className={cn(
                      'ml-auto text-[13px]',
                      row.attended ? 'text-signal-ok' : 'text-dusk-ink-800'
                    )}
                  >
                    {row.attended ? '출석' : '불참'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-dusk-ink-800">출석 명단은 팀 멤버에게만 보여요.</p>
          )}
        </section>
      </div>
    </main>
  )
}
