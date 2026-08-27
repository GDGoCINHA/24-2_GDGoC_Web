'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import { fetchMyActivities } from '@/services/eventApplication/eventApplicationClient'
import {
  ATTENDANCE_LABEL,
  type EventAttendanceStatus,
  type MyActivity
} from '@/types/eventApplication'
import { cn } from '@/utils/cn'

/** 지원서 상태 알약과 같은 색 체계를 쓴다. 한 화면에 나란히 서기 때문이다. */
const ATTENDANCE_CLASS: Record<EventAttendanceStatus, string> = {
  PENDING: 'bg-[rgba(126,150,200,0.22)] text-[#A9BBE0]',
  ATTENDED: 'bg-[rgba(134,192,143,0.22)] text-[#A6D0AC]',
  NO_SHOW: 'bg-[rgba(217,117,106,0.22)] text-[#E5A79F]'
}

/**
 * 마이페이지의 행사 참여 내역.
 *
 * 취소한 신청은 서버가 빼고 내려준다 — 이력이 아니기 때문이다.
 */
export default function MyEventActivitySection() {
  const { apiClient } = useAuthenticatedApi()

  const [activities, setActivities] = useState<MyActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    fetchMyActivities(apiClient)
      .then((loaded) => {
        if (alive) setActivities(loaded)
      })
      .catch(() => {
        if (alive) setError('참여 내역을 불러오지 못했습니다.')
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [apiClient])

  return (
    <section>
      <h2 className="text-xl font-semibold tracking-[-0.02em]">행사 참여 내역</h2>

      {loading ? (
        <p className="mt-6 text-[15px] text-dusk-ink-800">불러오는 중…</p>
      ) : error ? (
        <p className="mt-6 text-[15px] text-signal-err">{error}</p>
      ) : activities.length === 0 ? (
        <p className="mt-6 text-[15px] text-dusk-ink-800">아직 신청한 행사가 없습니다.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {activities.map((activity) => (
            <Link
              key={activity.applicationId}
              href={`/board/events/detail/?id=${activity.eventBoardId}`}
              className="flex w-full items-center gap-3.5 overflow-hidden rounded-full border border-[rgba(240,234,228,0.09)] bg-[rgba(240,234,228,0.05)] text-left transition-colors hover:bg-[rgba(240,234,228,0.09)]"
            >
              <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap px-[22px] py-[15px] text-[15px] text-dusk-ink-400">
                {activity.eventTitle}
              </span>
              <span className="shrink-0 text-xs tabular-nums text-dusk-ink-800 mobile:hidden">
                {activity.eventStartDate}
              </span>
              <span
                className={cn(
                  'shrink-0 px-[22px] py-[15px] text-center text-sm mobile:min-w-[126px] pc:min-w-[140px]',
                  ATTENDANCE_CLASS[activity.attendanceStatus]
                )}
              >
                {ATTENDANCE_LABEL[activity.attendanceStatus]}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
