import Image from 'next/image'

import { LANDING_HACKATHON_INTRO, LANDING_HACKATHONS } from '@/constant/landingContent'

import { ROW_CLASS } from './ActivitiesSection'

export default function HackathonsSection() {
  const { heading, body, photo } = LANDING_HACKATHON_INTRO

  return (
    <section id="hackathons" className="scroll-mt-[68px] border-t border-t-dusk-line-soft">
      <div className="mx-auto max-w-[1120px] px-[clamp(20px,5vw,44px)] py-[118px]">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <h2
            data-reveal
            className="max-w-[20ch] break-keep text-[clamp(26px,3.4vw,46px)] font-semibold leading-[1.32] tracking-[-0.03em]"
          >
            {heading}
          </h2>
          <p
            data-reveal
            className="flex-[0_1_320px] break-keep text-[15px] leading-[1.8] text-dusk-ink-600"
          >
            {body}
          </p>
        </div>

        <div className="mt-14 flex flex-wrap gap-10">
          <div className="flex min-w-0 flex-[1_1_520px] flex-col">
            {LANDING_HACKATHONS.map((item) => (
              <div
                key={item.title}
                data-reveal
                className={`flex flex-wrap items-baseline gap-x-6 gap-y-1.5 ${ROW_CLASS}`}
              >
                <span className="shrink-0 text-sm font-medium text-dusk-ink-800">{item.year}</span>
                <h3 className="m-0 flex-[1_1_200px] text-xl font-semibold tracking-[-0.02em]">
                  {item.title}
                </h3>
                <span className={`shrink-0 rounded-full px-[11px] py-1 text-xs ${item.badgeClass}`}>
                  {item.badge}
                </span>
                <p className="mt-1.5 flex-[1_1_100%] break-keep text-[15px] leading-[1.7] text-dusk-ink-600">
                  {item.body}
                </p>
              </div>
            ))}
          </div>

          <figure
            data-reveal
            className="group relative m-0 min-h-[320px] min-w-[260px] flex-[1_1_300px] overflow-hidden bg-dusk-slot"
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              loading="lazy"
              sizes="(max-width: 47.9375rem) 100vw, 300px"
              className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(.22,.61,.36,1)] group-hover:scale-105"
              style={{ objectPosition: `50% ${photo.focusY}%`, filter: 'saturate(0.82)' }}
            />
            <figcaption
              className="absolute inset-x-0 bottom-0 px-[18px] py-4 text-[13px] text-dusk-ink-100"
              style={{
                background: 'linear-gradient(0deg, rgba(23,19,28,0.84), rgba(23,19,28,0))'
              }}
            >
              {photo.caption}
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}
