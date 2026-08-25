'use client'

import { CORE_SCHEDULE, formatKoreanPeriod, resolveCoreSchedule } from '@/constant/recruitSchedule'
import { useRecruitCorePeriod } from '@/hooks/useRecruitCorePeriod'

type Props = {
  /** 서버가 내려준 실제 모집 기간. 있으면 이 값으로 렌더해 게이팅과 어긋나지 않게 한다. */
  applicationPeriod?: { openAt: string; closeAt: string }
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap justify-between gap-5 px-5 py-[18px]">
      <span className="text-sm text-dusk-ink-700">{label}</span>
      <span className="text-[15px]">{value}</span>
    </div>
  )
}

/**
 * 모집 일정표.
 *
 * 디자인은 1px 틈으로 괘선을 만들지만 여기 바탕은 그라디언트라 행을 불투명하게
 * 칠해야 그 수법이 먹는다. 같은 그림을 테두리로 낸다.
 */
export function RecruitScheduleCard({ applicationPeriod }: Props) {
  // 게이트를 거치지 않고 이 카드만 놓인 화면도 있다. 그때도 서류 접수 날짜가 아래 발표
  // 날짜와 같은 출처에서 나와야 한다 — 한쪽만 서버 값이면 접수와 발표가 다른 달로 보인다.
  const { period: corePeriod } = useRecruitCorePeriod()
  const schedule = resolveCoreSchedule(corePeriod?.notice)
  const period = applicationPeriod ??
    corePeriod ?? {
      openAt: CORE_SCHEDULE.fallbackOpenAt,
      closeAt: CORE_SCHEDULE.fallbackCloseAt
    }
  const applicationText = `${formatKoreanPeriod(period.openAt, period.closeAt)} 23:59:59`

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h2 className="text-[15px] font-medium text-dusk-ink-200">모집 일정</h2>
        <div className="mt-3 divide-y divide-[rgba(240,234,228,0.12)] overflow-hidden rounded-[14px] border border-[rgba(240,234,228,0.12)]">
          <Row label="서류 접수" value={applicationText} />
          <Row label="서류 결과" value={schedule.documentResult} />
          <Row label="면접" value={schedule.interview} />
          <Row label="최종 결과" value={schedule.finalResult} />
          <div className="flex flex-col gap-1.5 px-5 py-[18px] text-[13px] leading-[1.7] text-dusk-ink-800">
            <span>※ {schedule.interviewNote}</span>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-[15px] font-medium text-dusk-ink-200">면접 안내</h2>
        <div className="mt-3 flex flex-col gap-1.5 rounded-[14px] border border-[rgba(240,234,228,0.12)] px-5 py-[18px] text-[15px] leading-[1.7] text-dusk-ink-300">
          <p>원칙적으로 대면 면접을 진행하며, 부득이한 경우 비대면으로 조정될 수 있습니다.</p>
          <p>면접은 인하대학교 내부 장소에서 진행됩니다.</p>
        </div>
      </section>

      <section>
        <h2 className="text-[15px] font-medium text-dusk-ink-200">활동 안내</h2>
        <div className="mt-3 flex flex-col gap-1.5 rounded-[14px] border border-[rgba(240,234,228,0.12)] px-5 py-[18px] text-[15px] leading-[1.7] text-dusk-ink-300">
          <p>운영진으로 활동 시, 매주 1회 정기 운영진 회의에 필수 참석해야 합니다.</p>
          <p className="text-[13px] text-dusk-ink-800">※ {schedule.meetingNote}</p>
        </div>
      </section>
    </div>
  )
}
