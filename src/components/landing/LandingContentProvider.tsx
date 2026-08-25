'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

import { LANDING_CONTENT_FALLBACK } from '@/constant/landingContent'
import { fetchLandingContent } from '@/services/landing/landingClient'
import type { LandingContentDocument } from '@/types/landing'

/**
 * 온보딩에 실릴 콘텐츠를 고른다.
 *
 * 이 사이트는 정적 내보내기라 빌드 시점에 서버를 부를 수 없다. 그래서 첫 프레임은 번들에 든
 * 기본값으로 그리고, 뜬 뒤에 서버 발행본을 받아 덮어쓴다.
 *
 * 조회가 실패하면 아무것도 하지 않는다 — 기본값이 그대로 남아 화면은 깨지지 않는다. 대신
 * 마지막 배포 시점의 내용이 보인다는 뜻이기도 하다.
 */
const LandingContentContext = createContext<LandingContentDocument>(LANDING_CONTENT_FALLBACK)

export function LandingContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<LandingContentDocument>(LANDING_CONTENT_FALLBACK)

  useEffect(() => {
    let alive = true

    fetchLandingContent()
      .then((document) => {
        // 발행된 게 없으면 null 이다. 그때는 기본값을 그대로 둔다.
        if (alive && document) setContent(document)
      })
      .catch(() => {
        // 조용히 넘긴다. 첫 화면에 오류를 띄우는 것보다 예전 내용을 보여주는 편이 낫다.
      })

    return () => {
      alive = false
    }
  }, [])

  return <LandingContentContext.Provider value={content}>{children}</LandingContentContext.Provider>
}

export const useLandingContent = (): LandingContentDocument => useContext(LandingContentContext)
