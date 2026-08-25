'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'

import { useLandingContent } from '@/components/landing/LandingContentProvider'
import { formatKoreanPeriodShort } from '@/constant/recruitSchedule'
import { useMemberSchedule } from '@/hooks/useRecruitSchedule'

import { scrollToSection } from './LandingHeader'

export default function HeroSection() {
  const { hero, semesterLabel } = useLandingContent()
  const memberSchedule = useMemberSchedule()
  const contentRef = useRef<HTMLDivElement>(null)

  /** 스크롤을 내리는 동안 히어로 문구만 살짝 밀려 올라가며 옅어진다. */
  useEffect(() => {
    const content = contentRef.current
    if (!content) return

    const onScroll = () => {
      const progress = Math.min(1, window.scrollY / (window.innerHeight * 0.85))
      content.style.transform = `translateY(${(progress * -46).toFixed(1)}px)`
      content.style.opacity = String(1 - progress * 0.9)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const intensivePeriod = formatKoreanPeriodShort(
    memberSchedule.intensiveOpenAt,
    memberSchedule.intensiveCloseAt
  )

  return (
    <section id="top" className="relative flex min-h-svh items-end">
      <Image
        src={hero.photo.src}
        alt={hero.photo.alt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
        style={{
          objectPosition: `50% ${hero.photo.focusY}%`,
          filter: 'saturate(0.82) contrast(1.02)'
        }}
      />
      {/*
        중간 지점(38%)이 핸드오프 값(0.54)보다 진하다. 그 높이에 제목이 놓이는데
        지금 사진은 한가운데에 밝은 스크린이 있어 흰 글씨가 묻혔다.
        사진을 갈아끼울 때 배경이 어두우면 0.54 로 되돌려도 된다.
      */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(178deg, rgba(25,20,30,0.80) 0%, rgba(31,25,36,0.66) 38%, rgba(47,34,37,0.82) 100%)'
        }}
      />

      <div ref={contentRef} className="relative w-full px-[clamp(20px,5vw,44px)] pb-14 pt-[150px]">
        <div className="mx-auto flex max-w-[1120px] flex-wrap items-end justify-between gap-10">
          <div className="min-w-0 flex-[1_1_520px]">
            <h1 className="max-w-[20ch] break-keep text-[clamp(34px,5.2vw,74px)] font-semibold leading-[1.24] tracking-[-0.032em] text-balance">
              {hero.titleLead}
              <br />
              <span className="tracking-[-0.02em]">{hero.titleAccent}</span>
              {hero.titleTail}
            </h1>
            <p className="mt-7 text-[clamp(16px,1.5vw,20px)] leading-[1.7] text-dusk-ink-300">
              {hero.description}
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-3">
            <div className="flex flex-wrap items-baseline gap-2.5">
              <span aria-hidden className="size-1.5 rounded-full bg-signal-ok" />
              <span className="text-sm text-dusk-ink-200">{semesterLabel} 부원 모집 중</span>
              <span className="text-sm text-dusk-ink-700">집중 모집 {intensivePeriod}</span>
            </div>
            <a
              href="/recruit/"
              className="whitespace-nowrap rounded-full bg-ember px-[46px] py-[17px] text-base font-medium text-ember-ink transition-colors hover:bg-dusk-ink-100 hover:text-dusk-base"
            >
              지원하기
            </a>
            <p className="text-sm text-dusk-ink-600">{hero.ctaNote}</p>
          </div>
        </div>

        <div className="mx-auto mt-11 flex max-w-[1120px] items-center gap-3.5">
          <a
            href="#about"
            onClick={(event) => {
              event.preventDefault()
              scrollToSection('about')
            }}
            className="text-[13px] text-dusk-ink-600 transition-colors hover:text-dusk-ink-100"
          >
            더 알아보기 ↓
          </a>
          <span aria-hidden className="h-px flex-1 bg-[rgba(240,234,228,0.16)]" />
          <span className="text-[13px] text-dusk-ink-600">{hero.photo.caption}</span>
        </div>
      </div>
    </section>
  )
}
