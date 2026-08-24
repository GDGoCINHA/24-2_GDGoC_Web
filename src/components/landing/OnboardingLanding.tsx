'use client'

import { useEffect, useRef } from 'react'

import AboutSection from './onboarding/AboutSection'
import ActivitiesSection from './onboarding/ActivitiesSection'
import CursorGlow from './onboarding/CursorGlow'
import FaqSection from './onboarding/FaqSection'
import HackathonsSection from './onboarding/HackathonsSection'
import HeroSection from './onboarding/HeroSection'
import LandingFooter from './onboarding/LandingFooter'
import LandingHeader from './onboarding/LandingHeader'
import PhotoStrip from './onboarding/PhotoStrip'
import { useReveal } from './onboarding/useReveal'

/**
 * 온보딩(랜딩). 위에서 아래로 한 번에 읽히는 롱폼 구성이다.
 *
 * 바탕은 고정된 두 겹이다 — 아래에서 위로 물드는 그라디언트와, 그 위에 얹는
 * 따뜻한 발광. 둘 다 `position: fixed` 라서 스크롤해도 제자리에 남고, 콘텐츠는
 * 그 위를 지나간다. 발광만 스크롤에 아주 조금 따라 움직여 깊이를 만든다.
 */
export default function OnboardingLanding() {
  const rootRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)

  useReveal(rootRef)

  useEffect(() => {
    const glow = glowRef.current
    if (!glow) return

    const onScroll = () => {
      const shift = -Math.min(1, window.scrollY / window.innerHeight) * 6
      glow.style.transform = `translateY(${shift.toFixed(2)}%)`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      ref={rootRef}
      className="relative overflow-x-hidden bg-dusk-base font-pretendard text-dusk-ink-100"
    >
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: 'linear-gradient(178deg, #1B1622 0%, #221B28 42%, #302227 74%, #422A24 100%)'
        }}
      />
      <div
        ref={glowRef}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(120% 70% at 62% 104%, rgba(214,124,74,0.42) 0%, rgba(214,124,74,0.10) 42%, rgba(214,124,74,0) 68%), radial-gradient(80% 46% at 14% 96%, rgba(126,90,120,0.30) 0%, rgba(126,90,120,0) 62%)'
        }}
      />
      <CursorGlow />

      <div className="relative z-[2]">
        <LandingHeader />
        <HeroSection />
        <AboutSection />
        <PhotoStrip />
        <ActivitiesSection />
        <HackathonsSection />
        <FaqSection />
        <LandingFooter />
      </div>
    </div>
  )
}
