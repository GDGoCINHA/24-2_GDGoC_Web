import { Bullet } from '@/components/ui/common/Bullet'
import { CORE_SCHEDULE, formatKoreanDate } from '@/constant/recruitSchedule'

type Props = {
  /** 서버가 내려준 실제 모집 기간. 있으면 이 값으로 렌더해 게이팅과 어긋나지 않게 한다. */
  applicationPeriod?: { openAt: string; closeAt: string }
}

export function RecruitScheduleCard({ applicationPeriod }: Props) {
  const applicationText = applicationPeriod
    ? `${formatKoreanDate(applicationPeriod.openAt)} - ${formatKoreanDate(applicationPeriod.closeAt)} 23:59:59`
    : CORE_SCHEDULE.application

  return (
    <>
      <div className="space-y-2">
        <p className="pl-2 typo-pc-s2 mobile:typo-m-s1 text-white">모집 일정</p>
        <div className="rounded-xl bg-gray-100 px-4 py-3 text-white">
          <div className="space-y-4 typo-pc-b2 mobile:space-y-3 mobile:typo-m-b3">
            <div className="space-y-1">
              <Bullet>서류 지원 기간</Bullet>
              <p>{applicationText}</p>
            </div>
            <div className="space-y-1">
              <Bullet>서류 결과 발표</Bullet>
              <p>{CORE_SCHEDULE.documentResult}</p>
            </div>
            <div className="space-y-1">
              <Bullet>면접 진행 기간</Bullet>
              <p>{CORE_SCHEDULE.interview}</p>
              <p className="typo-pc-c2 mobile:typo-m-c2 text-gray-700">{CORE_SCHEDULE.interviewNote}</p>
            </div>
            <div className="space-y-1">
              <Bullet>최종 결과 발표</Bullet>
              <p>{CORE_SCHEDULE.finalResult}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="pl-2 typo-pc-s2 mobile:typo-m-s1 text-white">면접 안내</p>
        <div className="rounded-xl bg-gray-100 px-4 py-3 text-white typo-pc-b2 mobile:typo-m-b3">
          <Bullet>원칙적으로 대면 면접을 진행하며, 부득이한 경우 비대면으로 조정될 수 있습니다.</Bullet>
          <div className="mt-2">
            <Bullet>면접은 인하대학교 내부 장소에서 진행됩니다.</Bullet>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="pl-2 typo-pc-s2 mobile:typo-m-s1 text-white">활동 안내</p>
        <div className="rounded-xl bg-gray-100 px-4 py-3 text-white typo-pc-b2 mobile:typo-m-b3">
          <Bullet>운영진으로 활동 시, 매주 1회 정기 운영진 회의에 필수 참석해야 합니다.</Bullet>
          <p className="mt-1 typo-pc-c2 mobile:typo-m-c2 text-gray-700">{CORE_SCHEDULE.meetingNote}</p>
        </div>
      </div>
    </>
  )
}
