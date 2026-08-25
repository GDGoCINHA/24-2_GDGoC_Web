'use client'

import { useLandingContent } from '@/components/landing/LandingContentProvider'
import { LANDING_ABOUT_STYLE } from '@/constant/landingContent'

export default function AboutSection() {
  const { about } = useLandingContent()

  return (
    <section
      id="about"
      className="mx-auto max-w-[1120px] scroll-mt-[68px] px-[clamp(20px,5vw,44px)] py-[120px]"
    >
      <h2
        data-reveal
        className="max-w-[26ch] break-keep text-[clamp(26px,3.4vw,46px)] font-semibold leading-[1.32] tracking-[-0.03em]"
      >
        {about.heading[0]}
        <br />
        {about.heading[1]}
      </h2>

      <div
        data-reveal
        className="mt-11 max-w-[62ch] border-l border-l-[rgba(208,129,85,0.55)] pl-5"
      >
        <p className="break-keep text-base leading-[1.85] text-dusk-ink-400">{about.body}</p>
      </div>

      <div className="mt-24 grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-x-8 gap-y-10">
        {/* 번호와 색은 자리 순서로 붙인다. 문구만 관리자가 고치고 개수는 넷으로 고정이다. */}
        {about.values.map((value, index) => {
          const style = LANDING_ABOUT_STYLE[index]
          if (!style) return null

          return (
            <div key={style.index} data-reveal>
              <div className={`text-sm font-medium ${style.colorClass}`}>{style.index}</div>
              <h3 className="mt-3 text-[21px] font-semibold tracking-[-0.02em]">{value.title}</h3>
              <p className="mt-2.5 break-keep text-[15px] leading-[1.75] text-dusk-ink-600">
                {value.body}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
