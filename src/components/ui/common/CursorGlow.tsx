'use client'

import { useEffect, useRef } from 'react'

/**
 * 커서를 따라오는 원형 광원. 목표 좌표로 매 프레임 8% 씩만 다가가 지연을 만든다.
 * 포인터가 없는 기기에서는 아예 붙이지 않는다.
 */
export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const glow = glowRef.current
    if (!glow) return
    if (window.matchMedia('(hover: none)').matches) return

    let targetX = window.innerWidth / 2
    let targetY = window.innerHeight / 2
    let currentX = targetX
    let currentY = targetY
    let frame = 0

    const onMove = (event: PointerEvent) => {
      targetX = event.clientX
      targetY = event.clientY
      glow.style.opacity = '1'
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    const tick = () => {
      currentX += (targetX - currentX) * 0.08
      currentY += (targetY - currentY) * 0.08
      glow.style.transform = `translate3d(${currentX.toFixed(1)}px, ${currentY.toFixed(1)}px, 0)`
      frame = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div
      ref={glowRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[1] -ml-[280px] -mt-[280px] size-[560px] rounded-full opacity-0 transition-opacity duration-700 ease-out"
      style={{
        background: 'radial-gradient(circle, rgba(226,160,110,0.13), rgba(226,160,110,0) 60%)'
      }}
    />
  )
}
