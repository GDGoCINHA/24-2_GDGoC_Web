'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

import { formatActivityDate } from '@/components/club/clubDate'
import { ClubActivityStatusTag } from '@/components/club/ClubUi'
import { DUSK_GHOST_BUTTON } from '@/components/ui/dusk/DuskForm'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import { readClubError } from '@/services/club/clubClient'
import { fetchGlobalFeed } from '@/services/club/feedClient'
import type { ClubFeedItem } from '@/types/club'
import { cn } from '@/utils/cn'

/**
 * `/club` 의 「활동 피드」 탭 내용 (B 담당). 모든 소모임의 활동 기록을 사진 중심으로, 올라온 순서대로 보여 준다.
 *
 * 숨김 소모임은 서버가 뺀다. 출석 명단 없이 인원 수만 보인다. 카드를 누르면 활동 기록 상세로 간다.
 */
export function ClubGlobalFeed() {
  const { apiClient } = useAuthenticatedApi()
  const [items, setItems] = useState<ClubFeedItem[] | null>(null)
  const [page, setPage] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)

  const load = useCallback(() => {
    fetchGlobalFeed(apiClient, 0)
      .then(({ items: first, meta }) => {
        setItems(first)
        setPage(0)
        setHasNext(meta.hasNext)
        setError(null)
      })
      .catch((err) => setError(readClubError(err, '활동 피드를 불러오지 못했어요.')))
  }, [apiClient])

  useEffect(load, [load])

  const loadMore = async () => {
    setLoadingMore(true)
    try {
      const { items: more, meta } = await fetchGlobalFeed(apiClient, page + 1)
      setItems((prev) => [...(prev ?? []), ...more])
      setPage(page + 1)
      setHasNext(meta.hasNext)
    } catch (err) {
      window.alert(readClubError(err, '더 불러오지 못했어요.'))
    } finally {
      setLoadingMore(false)
    }
  }

  if (error) return <p className="py-12 text-center text-sm text-dusk-ink-800">{error}</p>
  if (!items) return <p className="py-12 text-center text-sm text-dusk-ink-800">불러오는 중…</p>
  if (items.length === 0) {
    return <p className="py-12 text-center text-sm text-dusk-ink-800">아직 올라온 활동이 없어요.</p>
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5 mobile:grid-cols-1">
        {items.map((item) => (
          <GlobalCard key={item.id} item={item} />
        ))}
      </div>
      {hasNext && (
        <button
          type="button"
          disabled={loadingMore}
          onClick={() => void loadMore()}
          className={cn(DUSK_GHOST_BUTTON, 'self-center')}
        >
          {loadingMore ? '불러오는 중…' : '더 보기'}
        </button>
      )}
    </div>
  )
}

function GlobalCard({ item }: { item: ClubFeedItem }) {
  const photos = item.photoUrls ?? []
  return (
    <Link
      href={`/club/activity/?clubId=${item.clubId}&id=${item.id}`}
      className="flex flex-col overflow-hidden rounded-[20px] border border-dusk-line-soft bg-dusk-raise"
    >
      <div className="grid h-[220px] grid-cols-[2fr_1fr] grid-rows-2 gap-0.5 mobile:h-[180px]">
        <Photo url={photos[0]} className="row-span-2" />
        <Photo url={photos[1]} />
        <div className="relative overflow-hidden bg-dusk-slot">
          {photos[2] && <Photo url={photos[2]} className="absolute inset-0" />}
          {photos.length > 3 && (
            <span className="absolute inset-0 flex items-center justify-center bg-[rgba(27,22,34,0.55)] text-[13px] text-dusk-ink-200">
              +{photos.length - 3}
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2 px-5 pb-[18px] pt-4">
        <div className="flex items-center justify-between gap-2 text-[13px] text-dusk-ink-700">
          <span className="truncate text-ember">{item.clubName}</span>
          <span className="shrink-0">
            {item.activityDate ? formatActivityDate(item.activityDate) : ''}
          </span>
        </div>
        <p className="line-clamp-3 text-[15px] leading-[1.55] text-dusk-ink-200">{item.content}</p>
        <div className="flex items-center gap-3.5 text-[13px] text-dusk-ink-800">
          <span>
            참석 {item.attendedCount ?? 0}/{item.rosterCount ?? 0}
          </span>
          <span>좋아요 {item.likeCount}</span>
          <span>댓글 {item.commentCount}</span>
          {item.status && (
            <span className="ml-auto">
              <ClubActivityStatusTag status={item.status} />
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

function Photo({ url, className }: { url?: string; className?: string }) {
  return (
    <div className={cn('overflow-hidden bg-dusk-slot', className)}>
      {url && (
        // next/image 는 못 쓴다 — S3 호스트를 remotePatterns 에 적을 수 없다.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" loading="lazy" className="h-full w-full object-cover" />
      )}
    </div>
  )
}
