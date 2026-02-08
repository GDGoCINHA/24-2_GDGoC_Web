'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import Lenis from '@studio-freight/lenis'

import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

import HeroSection from '@/components/landing/HeroSection'
import AboutSection from '@/components/landing/AboutSection'
import StatsSection from '@/components/landing/StatsSection'
import ActivitiesSection from '@/components/landing/ActivitiesSection'
import PartnersSection from '@/components/landing/PartnersSection'
import CTASection from '@/components/landing/CTASection'

gsap.registerPlugin(ScrollTrigger)

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.5,
      smoothWheel: true,
      wheelMultiplier: 0.8
    })

    const tickerHandler = (time: number) => {
      lenis.raf(time * 800)
    }

    gsap.ticker.add(tickerHandler)

    lenis.on('scroll', ScrollTrigger.update)

    return () => {
      lenis.destroy()
      gsap.ticker.remove(tickerHandler)
    }
  }, [])

  return (
    <div className="flex flex-col w-screen">
      <HeroSection router={router} />
      <AboutSection />
      <StatsSection />
      <ActivitiesSection />
      <PartnersSection />
      <CTASection router={router} />
    </div>
  )
}
