'use client'

import { useLandingContent } from '@/components/landing/LandingContentProvider'

/**
 * 행 호버는 좌측 패딩과 배경 틴트로 표현한다. transition 은 useReveal 이 심는
 * 인라인 스타일에 함께 들어 있다 — 인라인 transition 이 클래스 쪽을 덮어쓰기 때문.
 */
export const ROW_CLASS =
  'border-t border-t-dusk-line pb-[22px] pl-1 pr-1 pt-[22px] last:border-b last:border-b-dusk-line hover:bg-[linear-gradient(90deg,rgba(208,129,85,0.10),rgba(208,129,85,0))] hover:pl-[18px]'

export default function ActivitiesSection() {
  const { activities } = useLandingContent()

  return (
    <section id="activities" className="scroll-mt-[68px] border-t border-t-dusk-line-soft">
      <div className="mx-auto max-w-[1120px] px-[clamp(20px,5vw,44px)] py-[118px]">
        <h2
          data-reveal
          className="break-keep text-[clamp(26px,3.4vw,46px)] font-semibold leading-[1.32] tracking-[-0.03em]"
        >
          GDGoC INHA에서 할 수 있는 활동
        </h2>

        <div className="mt-15 flex flex-col">
          {activities.map((activity, index) => (
            <div
              key={activity.title}
              data-reveal
              className={`flex items-center gap-[clamp(16px,3vw,40px)] ${ROW_CLASS}`}
            >
              <span className="shrink-0 text-sm font-medium text-dusk-ink-800">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="flex-[0_0_clamp(110px,16vw,200px)] text-[clamp(20px,2.2vw,30px)] font-semibold tracking-[-0.025em]">
                {activity.title}
              </h3>
              <p className="break-keep text-base leading-[1.7] text-dusk-ink-600">
                {activity.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
