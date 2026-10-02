'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'

import type { ClubActivityStatus, ClubCategory, ClubPostCategory } from '@/types/club'
import {
  CLUB_ACTIVITY_STATUS_LABEL,
  CLUB_CATEGORY_LABEL,
  CLUB_POST_CATEGORY_LABEL
} from '@/types/club'
import { cn } from '@/utils/cn'

/**
 * 소모임 화면이 함께 쓰는 작은 조각.
 *
 * 색은 Tailwind 클래스 리터럴로 적어야 스캐너가 찾는다. 값을 조립하면 빌드에서 빠진다.
 */

const TAG = 'inline-flex shrink-0 rounded-full px-2.5 py-[3px] text-xs'

const CATEGORY_CLASS: Record<ClubCategory, string> = {
  STUDY: 'bg-[rgba(126,150,200,0.20)] text-tag-info',
  HOBBY: 'bg-[rgba(134,192,143,0.20)] text-signal-ok',
  CAREER: 'bg-[rgba(208,129,85,0.18)] text-ember',
  ETC: 'bg-[rgba(240,234,228,0.10)] text-dusk-ink-500'
}

export function ClubCategoryTag({ category }: { category: ClubCategory }) {
  return <span className={cn(TAG, CATEGORY_CLASS[category])}>{CLUB_CATEGORY_LABEL[category]}</span>
}

export function ClubRecruitTag({ recruiting }: { recruiting: boolean }) {
  return recruiting ? (
    <span className={cn(TAG, 'border border-[rgba(208,129,85,0.6)] text-ember')}>모집 중</span>
  ) : (
    <span className={cn(TAG, 'border border-[rgba(240,234,228,0.2)] text-dusk-ink-800')}>
      모집 마감
    </span>
  )
}

const ACTIVITY_STATUS_CLASS: Record<ClubActivityStatus, string> = {
  PENDING: 'bg-[rgba(224,162,78,0.18)] text-tag-event',
  APPROVED: 'bg-[rgba(134,192,143,0.20)] text-signal-ok',
  REVISION_REQUESTED: 'bg-[rgba(217,117,106,0.18)] text-signal-err'
}

export function ClubActivityStatusTag({ status }: { status: ClubActivityStatus }) {
  return (
    <span className={cn(TAG, ACTIVITY_STATUS_CLASS[status])}>
      {CLUB_ACTIVITY_STATUS_LABEL[status]}
    </span>
  )
}

const POST_CATEGORY_CLASS: Record<ClubPostCategory, string> = {
  NOTICE: 'bg-[rgba(208,129,85,0.18)] text-ember',
  QUESTION: 'bg-[rgba(240,234,228,0.10)] text-dusk-ink-500',
  REVIEW: 'bg-[rgba(134,192,143,0.20)] text-signal-ok',
  RESOURCE: 'bg-[rgba(126,150,200,0.20)] text-tag-info'
}

export function ClubPostCategoryTag({ category }: { category: ClubPostCategory }) {
  return (
    <span className={cn(TAG, POST_CATEGORY_CLASS[category])}>
      {CLUB_POST_CATEGORY_LABEL[category]}
    </span>
  )
}

export function ClubLeaderTag() {
  return <span className={cn(TAG, 'bg-[rgba(208,129,85,0.18)] text-ember')}>이끔이</span>
}

/** 이미지가 없을 때 대신 까는 면. 카드 높이가 흔들리지 않게 한다. */
export function ClubCover({
  imageUrl,
  className
}: {
  imageUrl: string | null
  className?: string
}) {
  return (
    <div className={cn('overflow-hidden bg-dusk-slot', className)}>
      {imageUrl && (
        // next/image 는 못 쓴다 — S3 호스트를 remotePatterns 에 적을 수 없다.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
      )}
    </div>
  )
}

/** 사진 자리. 실제 사진이 붙기 전까지 칸만 보여준다. */
export function ClubPhotoGrid({ urls, count = 3 }: { urls: string[]; count?: number }) {
  const cells = urls.length > 0 ? urls.slice(0, 3) : Array.from({ length: count }, () => '')
  return (
    <div className="grid h-[200px] grid-cols-3 gap-0.5 mobile:h-[150px]">
      {cells.map((url, index) => (
        <div key={index} className="overflow-hidden bg-dusk-slot">
          {url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" loading="lazy" className="h-full w-full object-cover" />
          )}
        </div>
      ))}
    </div>
  )
}

/** 좋아요·댓글 줄 (C 담당). 지금은 숫자만 보여준다. */
export function ReactionBar({
  likeCount,
  commentCount,
  children
}: {
  likeCount: number
  commentCount: number
  children?: ReactNode
}) {
  return (
    <div className="flex items-center gap-5 border-t border-dusk-line-soft pt-3 text-[13px]">
      <button type="button" className="min-h-9 text-ember">
        ♥ 좋아요 {likeCount}
      </button>
      <button type="button" className="min-h-9 text-dusk-ink-700">
        댓글 {commentCount}
      </button>
      {children}
    </div>
  )
}

/**
 * 카카오톡 공유 버튼 (C 담당). SDK 연동 전이라 아직 아무것도 보내지 않는다.
 * 공식 공유 기능만 쓴다 — 단톡방 자동 발송은 공식 API 가 없다.
 */
export function KakaoShareButton({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <button type="button" className="min-h-9 text-[13px] text-dusk-ink-700">
        카카오톡 공유
      </button>
    )
  }
  return (
    <button
      type="button"
      className="inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full border border-[rgba(240,234,228,0.20)] px-5 text-sm text-dusk-ink-400 transition-colors hover:border-[rgba(240,234,228,0.5)] hover:text-dusk-ink-100"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
      </svg>
      카카오톡 공유
    </button>
  )
}

/** 화면 안에서 쓰는 밑줄 탭. 좁으면 가로로 스크롤된다. */
export function ClubTabs<T extends string>({
  tabs,
  current,
  onChange,
  label
}: {
  tabs: { id: T; label: string; count?: number }[]
  current: T
  onChange: (id: T) => void
  label: string
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="flex gap-1 overflow-x-auto border-b border-dusk-line"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={current === tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            '-mb-px min-h-11 whitespace-nowrap border-b-2 px-[18px] text-[15px] transition-colors',
            current === tab.id
              ? 'border-ember font-semibold text-dusk-ink-100'
              : 'border-transparent text-dusk-ink-800 hover:text-dusk-ink-100'
          )}
        >
          {tab.label}
          {tab.count ? <span className="ml-1.5 text-xs text-ember">{tab.count}</span> : null}
        </button>
      ))}
    </div>
  )
}

/** 화면 위 「목록으로」 같은 뒤로가기 줄. */
export function ClubBackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="text-[13px] text-dusk-ink-800 transition-colors hover:text-dusk-ink-100"
    >
      ← {label}
    </Link>
  )
}
