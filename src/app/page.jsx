"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Lenis from '@studio-freight/lenis';

import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

import HeroSection from '@/components/sections/HeroSection';
import AboutSection from '@/components/sections/AboutSection';
import StatsSection from '@/components/sections/StatsSection';
import ActivitiesSection from '@/components/sections/ActivitiesSection';
import StudySection from '@/components/sections/StudySection';
import PartnersSection from '@/components/sections/PartnersSection';
import CTASection from '@/components/sections/CTASection';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {

  const router = useRouter();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.5,
      smoothWheel: true,
      wheelMultiplier: 0.8,
      smoothTouch: true,
    });

    gsap.ticker.add((time) => {
      lenis.raf(time * 800);
    });

    lenis.on('scroll', ScrollTrigger.update);

    return () => {
      lenis.destroy();
      gsap.ticker.remove();
    };
  }, []);


  return (
    <div className='flex flex-col w-screen'>
      <HeroSection router={router} />
      <AboutSection />
      <StatsSection />
      <ActivitiesSection />
      <StudySection />
      <PartnersSection />
      <CTASection router={router} />
    </div>
  );
}
