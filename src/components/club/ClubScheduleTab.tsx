'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

import { formatScheduleTime } from '@/components/club/clubDate'
import { KakaoShareButton } from '@/components/club/ClubUi'
import { DUSK_GHOST_BUTTON } from '@/components/ui/dusk/DuskForm'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import { readClubError } from '@/services/club/clubClient'
import { fetchSchedules, respondSchedule } from '@/services/club/scheduleClient'
import type { ClubMembership, ClubRsvp, ClubSchedule } from '@/types/club'
import { cn } from '@/utils/cn'

const RSVP_BUTTON = 'min-h-11 flex-1 rounded-full border text-sm disabled:opacity-60'
const RSVP_ON = 'border-ember bg-[rgba(208,129,85,0.18)] text-dusk-ink-100'
const RSVP_OFF = 'border-[rgba(240,234,228,0.2)] text-dusk-ink-400'
const LEADER_LINK = 'min-h-9 text-[13px] text-ember'

/**
 * 상세 「일정·출석」 탭 (B 담당).
 *
 * 일정은 부원 누구나 본다. 참석 예정 응답은 팀원만, 일정 관리·QR 은 리더만 한다.
 * 참석 예정 응답은 실제 출석과 무관하다 — 실제 출석은 리더가 활동 기록에 제출한다.
 */
export function ClubScheduleTab({
  clubId,
  myMembership
}: {
  clubId: number
  myMembership: ClubMembership | null
}) {
  const { apiClient } = useAuthenticatedApi()
  const isMember = myMembership?.status === 'ACTIVE'
  const isLeader = Boolean(myMembership?.isLeader)
  const [upcoming, setUpcoming] = useState<ClubSchedule[] | null>(null)
  const [past, setPast] = useState<ClubSchedule[]>([])
  const [error, setError] = useState<string | null>(null)
  /** 응답을 보내는 중인 일정. 버튼을 두 번 눌러 요청이 겹치지 않게 한다. */
  const [responding, setResponding] = useState<number | null>(null)

  const load = useCallback(() => {
    Promise.all([
      fetchSchedules(apiClient, clubId, 'upcoming'),
      fetchSchedules(apiClient, clubId, 'past')
    ])
      .then(([nextSchedules, pastSchedules]) => {
        setUpcoming(nextSchedules)
        setPast(pastSchedules)
        setError(null)
      })
      .catch((err) => setError(readClubError(err, '일정을 불러오지 못했어요.')))
  }, [apiClient, clubId])

  useEffect(load, [load])

  const respond = async (scheduleId: number, response: ClubRsvp) => {
    setResponding(scheduleId)
    try {
      await respondSchedule(apiClient, scheduleId, response)
      load()
    } catch (err) {
      window.alert(readClubError(err))
    } finally {
      setResponding(null)
    }
  }

  if (error) return <p className="py-12 text-center text-sm text-dusk-ink-800">{error}</p>
  if (!upcoming) return <p className="py-12 text-center text-sm text-dusk-ink-800">불러오는 중…</p>

  const [next, ...later] = upcoming

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] items-start gap-6 mobile:grid-cols-1">
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">다음 일정</h2>
          {isLeader && (
            <Link href={`/club/schedule/edit/?clubId=${clubId}`} className={DUSK_GHOST_BUTTON}>
              일정 등록
            </Link>
          )}
        </div>

        {!next && <p className="text-sm text-dusk-ink-800">예정된 일정이 없어요.</p>}

        {next && (
          <div className="flex flex-col gap-3 rounded-[20px] border border-[rgba(208,129,85,0.45)] bg-dusk-raise p-5">
            <div className="text-[13px] text-ember">{formatScheduleTime(next.startsAt)}</div>
            <div className="text-lg font-semibold">{next.title}</div>
            <SchedulePlace schedule={next} />
            {next.description && (
              <p className="whitespace-pre-line text-sm leading-[1.6] text-dusk-ink-400">
                {next.description}
              </p>
            )}
            {isMember && (
              <div className="mt-1 flex gap-2">
                {(['ATTEND', 'ABSENT'] as const).map((response) => (
                  <button
                    key={response}
                    type="button"
                    disabled={responding === next.id}
                    onClick={() => void respond(next.id, response)}
                    className={cn(RSVP_BUTTON, next.myResponse === response ? RSVP_ON : RSVP_OFF)}
                  >
                    {response === 'ATTEND' ? '참석 예정' : '불참 예정'}
                  </button>
                ))}
              </div>
            )}
            <div className="text-[13px] text-dusk-ink-800">
              참석 예정 {next.attendCount}명 · 불참 {next.absentCount}명 · 미응답{' '}
              {next.noResponseCount}명
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              {isLeader && <LeaderActions clubId={clubId} scheduleId={next.id} />}
              {/* TODO(C): 회차 제목·날짜·장소를 공유한다(기획 2.10). */}
              <KakaoShareButton compact />
            </div>
          </div>
        )}

        {later.map((schedule) => (
          <div
            key={schedule.id}
            className="flex flex-col gap-1.5 rounded-[14px] border border-dusk-line px-[18px] py-3.5 text-sm"
          >
            <div className="flex flex-wrap justify-between gap-2">
              <span>
                {formatScheduleTime(schedule.startsAt)} · {schedule.title}
              </span>
              <span className="text-dusk-ink-800">{summaryOf(schedule)}</span>
            </div>
            {isLeader && (
              <div className="flex flex-wrap gap-x-4">
                <LeaderActions clubId={clubId} scheduleId={schedule.id} />
              </div>
            )}
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">지난 일정</h2>
        {past.length === 0 ? (
          <p className="text-sm text-dusk-ink-800">지난 일정이 없어요.</p>
        ) : (
          <div className="overflow-hidden rounded-[20px] border border-dusk-line">
            {past.map((schedule) => (
              <div
                key={schedule.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-dusk-line-soft px-[18px] py-3.5 text-sm last:border-b-0"
              >
                <span className="text-dusk-ink-200">
                  {formatScheduleTime(schedule.startsAt)} · {schedule.title}
                </span>
                {isLeader && (
                  <Link
                    href={`/club/activity/edit/?clubId=${clubId}&scheduleId=${schedule.id}`}
                    className={LEADER_LINK}
                  >
                    활동 기록 작성
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
        {/* TODO(B): 「내 출석」과 출석 수정 요청은 출석 수정 요청 API(6번)가 나오면 붙인다. */}
      </section>
    </div>
  )
}

/** 목록 한 줄의 오른쪽: 내 응답이 있으면 그것, 없으면 장소. */
const summaryOf = (schedule: ClubSchedule): string => {
  if (schedule.myResponse === 'ATTEND') return '참석 예정'
  if (schedule.myResponse === 'ABSENT') return '불참 예정'
  return schedule.location ?? (schedule.onlineLink ? '온라인' : '')
}

function SchedulePlace({ schedule }: { schedule: ClubSchedule }) {
  if (!schedule.location && !schedule.onlineLink) return null
  return (
    <div className="flex flex-wrap gap-x-3 text-sm text-dusk-ink-700">
      {schedule.location && <span>{schedule.location}</span>}
      {schedule.onlineLink && (
        <a
          href={schedule.onlineLink}
          target="_blank"
          rel="noreferrer"
          className="text-tag-info underline"
        >
          온라인 링크
        </a>
      )}
    </div>
  )
}

/** 리더만: QR 띄우기 · 수정 · 이 일정으로 활동 기록 작성. */
function LeaderActions({ clubId, scheduleId }: { clubId: number; scheduleId: number }) {
  return (
    <>
      <Link href={`/club/schedule/qr/?clubId=${clubId}&id=${scheduleId}`} className={LEADER_LINK}>
        QR 띄우기
      </Link>
      <Link href={`/club/schedule/edit/?clubId=${clubId}&id=${scheduleId}`} className={LEADER_LINK}>
        수정
      </Link>
      <Link
        href={`/club/activity/edit/?clubId=${clubId}&scheduleId=${scheduleId}`}
        className={LEADER_LINK}
      >
        활동 기록 작성
      </Link>
    </>
  )
}
