'use client'

import { useEffect, type RefObject } from 'react'

/**
 * `data-reveal` 이 붙은 요소를 스크롤 진입 시점에 띄운다.
 *
 * CSS 만으로는 형제 순서에 따른 스태거를 줄 수 없어 스타일을 직접 심는다.
 * transition 에 padding·background 를 함께 넣는 이유는, 인라인 transition 이
 * Tailwind 의 hover transition 을 덮어써서 행 호버가 뚝 끊기기 때문이다.
 *
 * 폴백이 핵심이다 — IntersectionObserver 가 어떤 이유로든 콜백을 놓치면
 * 페이지 전체가 영구히 투명해진다. 4초 뒤 무조건 전부 표시한다.
 */
const FALLBACK_MS = 4000

export function useReveal(containerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const items = Array.from(container.querySelectorAll<HTMLElement>('[data-reveal]'))
    if (items.length === 0) return

    const show = (el: HTMLElement) => {
      el.style.opacity = '1'
      el.style.transform = 'none'
    }

    items.forEach((el, index) => {
      const delay = (index % 5) * 0.06
      el.style.opacity = '0'
      el.style.transform = 'translateY(20px)'
      el.style.transition =
        `opacity .85s cubic-bezier(.22,.61,.36,1) ${delay}s,` +
        ` transform .95s cubic-bezier(.22,.61,.36,1) ${delay}s,` +
        ' padding .4s ease, background .4s ease'
    })

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          show(entry.target as HTMLElement)
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -6% 0px' }
    )
    items.forEach((el) => observer.observe(el))

    const fallback = window.setTimeout(() => items.forEach(show), FALLBACK_MS)

    return () => {
      observer.disconnect()
      window.clearTimeout(fallback)
    }
  }, [containerRef])
}
