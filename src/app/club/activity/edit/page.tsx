'use client'

import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

import { ClubBackLink } from '@/components/club/ClubUi'
import { ClubSiteHeader } from '@/components/club/ClubSiteHeader'
import {
  DUSK_CANCEL_BUTTON,
  DUSK_CHECKBOX,
  DUSK_INPUT,
  DUSK_OPTION,
  DUSK_SELECT,
  DUSK_SUBMIT_BUTTON,
  DUSK_TEXTAREA,
  DuskField
} from '@/components/ui/dusk/DuskForm'
import { MOCK_ROSTER, MOCK_SCHEDULES } from '@/mock/clubMock'
import { cn } from '@/utils/cn'

const REQUIRED_RATIO = 0.5

/**
 * 활동 기록 작성·수정 (B 담당). 출석 체크와 인증 업로드를 한 화면에서 제출한다.
 *
 * 명단은 서버가 활동일 기준으로 정한다 — GET /api/v1/clubs/{id}/activities/roster?date=.
 * 인증 완료된 기록은 이 화면으로 들어올 수 없다(서버 409).
 */
export default function ClubActivityEditPage() {
  const searchParams = useSearchParams()
  const clubId = searchParams.get('clubId') ?? ''
  const [attended, setAttended] = useState<Record<number, boolean>>(() =>
    Object.fromEntries(MOCK_ROSTER.map((row) => [row.userId, row.attended]))
  )

  // TODO(B): 수정 화면이면 보완 요청 사유를 서버에서 받는다.
  const revisionReason: string | null = null
  const attendedCount = Object.values(attended).filter(Boolean).length
  const required = Math.ceil(MOCK_ROSTER.length * REQUIRED_RATIO)

  return (
    <main className="min-h-screen">
      <ClubSiteHeader />
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-7 px-[clamp(20px,5vw,44px)] pb-[100px] pt-11 mobile:pt-6">
        <div>
          <ClubBackLink href={`/club/detail/?id=${clubId}`} label="소모임으로" />
          <h1 className="mt-6 text-[clamp(25px,3vw,36px)] font-semibold leading-[1.3] tracking-[-0.03em]">
            활동 기록 작성
          </h1>
          <p className="mt-2.5 text-sm leading-[1.6] text-dusk-ink-700">
            출석과 인증을 한 번에 제출해요. 제출하면 팀 피드와 운영진 검토 목록에 올라가요.
          </p>
        </div>

        {revisionReason && (
          <div className="flex flex-col gap-1.5 rounded-[14px] border border-[rgba(217,117,106,0.45)] bg-[rgba(217,117,106,0.08)] px-[18px] py-4">
            <div className="text-sm font-semibold text-signal-err">운영진 보완 요청</div>
            <div className="text-sm leading-[1.6] text-dusk-ink-200">{revisionReason}</div>
          </div>
        )}

        <form className="flex flex-col gap-6" onSubmit={(event) => event.preventDefault()}>
          <div className="grid grid-cols-2 gap-3 mobile:grid-cols-1">
            <DuskField label="활동일" required>
              <input type="date" className={cn(DUSK_INPUT, '[color-scheme:dark]')} />
            </DuskField>
            <DuskField label="연결 일정 (선택)">
              <select className={DUSK_SELECT} defaultValue="">
                <option value="" className={DUSK_OPTION}>
                  일정 없이 기록
                </option>
                {MOCK_SCHEDULES.map((schedule) => (
                  <option key={schedule.id} value={schedule.id} className={DUSK_OPTION}>
                    {schedule.startsAt} · {schedule.title}
                  </option>
                ))}
              </select>
            </DuskField>
          </div>

          <DuskField
            label="실제 참석자"
            required
            group
            hint="명단은 활동일 기준 팀원이에요. 이후에 합류한 사람은 나오지 않아요."
          >
            <div className="flex justify-end text-[13px]">
              <span className={attendedCount >= required ? 'text-signal-ok' : 'text-tag-event'}>
                {attendedCount} / {MOCK_ROSTER.length}명 · 필요 {required}명{' '}
                {attendedCount >= required ? '충족' : '미달'}
              </span>
            </div>
            <div className="overflow-hidden rounded-[14px] border border-dusk-line">
              {MOCK_ROSTER.map((row) => (
                <label
                  key={row.userId}
                  className="flex min-h-12 cursor-pointer items-center gap-3 border-b border-dusk-line-soft px-4 py-3 last:border-b-0"
                >
                  <input
                    type="checkbox"
                    checked={attended[row.userId] ?? false}
                    onChange={(event) =>
                      setAttended((prev) => ({ ...prev, [row.userId]: event.target.checked }))
                    }
                    className={DUSK_CHECKBOX}
                  />
                  <span className="text-[15px]">{row.name}</span>
                  {row.qr && (
                    <span className="inline-flex rounded-full bg-[rgba(126,150,200,0.20)] px-2 py-0.5 text-[11px] text-tag-info">
                      QR 체크인
                    </span>
                  )}
                  {row.isLeader && (
                    <span className="ml-auto text-[13px] text-dusk-ink-800">리더</span>
                  )}
                </label>
              ))}
            </div>
          </DuskField>

          <DuskField
            label="활동 사진 (1장 이상)"
            required
            group
            hint="사진은 로그인한 부원 전체에게 공개돼요"
          >
            <div className="grid grid-cols-4 gap-2">
              <div className="aspect-square rounded-xl bg-dusk-slot" />
              <div className="aspect-square rounded-xl bg-dusk-field" />
              <button
                type="button"
                aria-label="사진 추가"
                className="aspect-square rounded-xl border border-dashed border-dusk-line-dashed text-2xl text-dusk-ink-700"
              >
                +
              </button>
            </div>
          </DuskField>

          <DuskField label="활동 내용" required>
            <textarea rows={4} className={DUSK_TEXTAREA} />
          </DuskField>

          <DuskField label="목표 진행 상황 (선택)">
            <input type="text" placeholder="예: 6명 중 3명 골드 4 달성" className={DUSK_INPUT} />
          </DuskField>

          <div className="sticky bottom-0 flex gap-2.5 bg-dusk-base pb-3 pt-2">
            <a href={`/club/detail/?id=${clubId}`} className={DUSK_CANCEL_BUTTON}>
              취소
            </a>
            <button type="submit" className={DUSK_SUBMIT_BUTTON}>
              {revisionReason ? '수정해서 다시 제출' : '제출하기'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
