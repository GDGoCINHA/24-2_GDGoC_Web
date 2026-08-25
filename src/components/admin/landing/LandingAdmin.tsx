'use client'

import { useCallback, useEffect, useState } from 'react'

import { SchedulePanel } from '@/components/admin/landing/SchedulePanel'
import {
  ActivitiesPanel,
  FaqPanel,
  HackathonsPanel,
  HeroPanel,
  PhotoStripPanel
} from '@/components/admin/landing/panels'
import { DUSK_GHOST_BUTTON, DUSK_PRIMARY_BUTTON } from '@/components/ui/dusk/DuskForm'
import { LANDING_CONTENT_FALLBACK } from '@/constant/landingContent'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import {
  fetchLandingDraft,
  publishLandingContent,
  saveLandingDraft
} from '@/services/landing/landingClient'
import type { LandingContentDocument } from '@/types/landing'
import { cn } from '@/utils/cn'

type TabId = 'hero' | 'strip' | 'activities' | 'hackathons' | 'schedule' | 'faq'

const TABS: { id: TabId; label: string }[] = [
  { id: 'hero', label: '히어로' },
  { id: 'strip', label: '사진 띠' },
  { id: 'activities', label: '활동' },
  { id: 'hackathons', label: '대회 · 해커톤' },
  { id: 'schedule', label: '모집 일정' },
  { id: 'faq', label: 'FAQ' }
]

/**
 * 온보딩 콘텐츠 관리.
 *
 * 문서 전체를 화면이 들고 있다가 저장할 때 통째로 보낸다. 부분 저장을 하지 않는 이유는
 * 이 페이지가 항상 한 덩어리로 편집·발행되기 때문이다.
 *
 * 저장은 초안까지고, 방문자에게 나가려면 발행을 눌러야 한다. 모집 일정 탭만 예외로 즉시
 * 반영된다 — 그쪽은 화면 문구가 아니라 지원 창구를 여닫는 값이다.
 */
export default function LandingAdmin() {
  const { apiClient } = useAuthenticatedApi()

  const [tab, setTab] = useState<TabId>('hero')
  const [document, setDocument] = useState<LandingContentDocument>(LANDING_CONTENT_FALLBACK)
  const [loading, setLoading] = useState(true)
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    setLoading(true)

    fetchLandingDraft(apiClient)
      .then((draft) => {
        // 서버에 아무것도 없으면 번들 기본값에서 시작한다. 빈 화면을 주면 처음 쓰는
        // 사람이 여섯 탭을 전부 채워야 한다.
        if (alive && draft) setDocument(draft)
      })
      .catch(() => {
        if (alive) setError('초안을 불러오지 못했습니다. 기본값에서 시작합니다.')
      })
      .finally(() => {
        if (alive) setLoading(false)
      })

    return () => {
      alive = false
    }
  }, [apiClient])

  const change = useCallback((next: LandingContentDocument) => {
    setDocument(next)
    setDirty(true)
    setMessage(null)
  }, [])

  const handleSave = async () => {
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      await saveLandingDraft(apiClient, document)
      setDirty(false)
      setMessage('초안을 저장했습니다. 방문자에게 나가려면 발행을 눌러 주세요.')
    } catch {
      setError('저장에 실패했습니다. 입력값을 확인해 주세요.')
    } finally {
      setBusy(false)
    }
  }

  const handlePublish = async () => {
    if (dirty && !window.confirm('저장하지 않은 변경이 있습니다. 마지막 저장본을 발행할까요?')) {
      return
    }
    if (!window.confirm('지금 초안을 방문자에게 내보냅니다. 계속할까요?')) return

    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      await publishLandingContent(apiClient)
      setMessage('발행했습니다. 온보딩을 새로 열면 반영된 내용이 보입니다.')
    } catch {
      setError('발행에 실패했습니다.')
    } finally {
      setBusy(false)
    }
  }

  const counts: Record<TabId, string> = {
    hero: '사진 1',
    strip: `사진 ${document.photoStrip.length}`,
    activities: `${document.activities.length}개`,
    hackathons: `${document.hackathons.length}개`,
    schedule: '2종',
    faq: `${document.faqs.length}개`
  }

  if (loading) {
    return (
      <main className="min-h-screen px-6 py-16 text-center">
        <p className="text-[15px] text-dusk-ink-800">불러오는 중...</p>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-[1180px] px-[clamp(20px,5vw,44px)] pb-24 pt-14">
      <div className="flex flex-wrap items-baseline justify-between gap-5">
        <div>
          <h1 className="text-[clamp(26px,3vw,38px)] font-semibold leading-[1.26] tracking-[-0.03em]">
            온보딩 콘텐츠 관리
          </h1>
          <p className="mt-3 text-sm text-dusk-ink-700">
            저장은 초안까지입니다. 방문자에게 나가려면 발행을 눌러 주세요.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button type="button" onClick={handleSave} disabled={busy} className={DUSK_GHOST_BUTTON}>
            {busy ? '처리 중...' : dirty ? '초안 저장 *' : '초안 저장'}
          </button>
          <button
            type="button"
            onClick={handlePublish}
            disabled={busy}
            className={DUSK_PRIMARY_BUTTON}
          >
            발행
          </button>
        </div>
      </div>

      {message && <p className="mt-5 text-sm text-signal-ok">{message}</p>}
      {error && <p className="mt-5 text-sm text-signal-err">{error}</p>}

      <div className="mt-9 flex flex-wrap gap-8 pc:flex-nowrap">
        {/* 좁은 화면에서는 가로로 흐르는 탭 줄이 된다. 사이드바를 세로로 두면 본문이 밀린다. */}
        <nav className="flex w-full shrink-0 flex-row gap-2 overflow-x-auto pb-1 pc:w-[220px] pc:flex-col pc:overflow-visible pc:pb-0">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                'flex shrink-0 items-center justify-between gap-3 whitespace-nowrap rounded-xl px-4 py-3 text-left text-sm transition-colors pc:shrink',
                tab === item.id
                  ? 'bg-[rgba(240,234,228,0.10)] text-dusk-ink-100'
                  : 'text-dusk-ink-500 hover:text-dusk-ink-100'
              )}
            >
              <span>{item.label}</span>
              <span className="text-[11px] text-dusk-ink-800">{counts[item.id]}</span>
            </button>
          ))}
        </nav>

        <div className="min-w-0 flex-1">
          {tab === 'hero' && (
            <HeroPanel document={document} onChange={change} apiClient={apiClient} />
          )}
          {tab === 'strip' && (
            <PhotoStripPanel document={document} onChange={change} apiClient={apiClient} />
          )}
          {tab === 'activities' && (
            <ActivitiesPanel document={document} onChange={change} apiClient={apiClient} />
          )}
          {tab === 'hackathons' && (
            <HackathonsPanel document={document} onChange={change} apiClient={apiClient} />
          )}
          {tab === 'schedule' && <SchedulePanel apiClient={apiClient} />}
          {tab === 'faq' && (
            <FaqPanel document={document} onChange={change} apiClient={apiClient} />
          )}
        </div>
      </div>
    </main>
  )
}
