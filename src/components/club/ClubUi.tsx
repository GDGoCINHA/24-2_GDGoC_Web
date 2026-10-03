'use client'

import Link from 'next/link'
import { type ReactNode, useCallback, useEffect, useState } from 'react'

import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import { KAKAO_JS_KEY, shareToKakao } from '@/lib/kakao/kakaoShare'
import { readClubError } from '@/services/club/clubClient'
import {
  createClubComment,
  deleteClubComment,
  fetchClubComments,
  setClubLike
} from '@/services/club/clubCompletionClient'
import type {
  ClubActivityStatus,
  ClubCategory,
  ClubComment,
  ClubPostCategory,
  ClubTargetType
} from '@/types/club'
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

const HIDDEN_STATUS_LABEL: Record<'PENDING' | 'REJECTED' | 'HIDDEN', string> = {
  PENDING: '개설 승인 대기',
  REJECTED: '개설 반려',
  HIDDEN: '숨김'
}

/** 운영진에게만 보이는 공개 전·숨김 소모임 표시. 공개(ACTIVE·ENDED)는 모집 태그를 쓴다. */
export function ClubStatusTag({ status }: { status: 'PENDING' | 'REJECTED' | 'HIDDEN' }) {
  return (
    <span
      className={cn(
        TAG,
        status === 'REJECTED' ? 'text-signal-err' : 'text-tag-event',
        'border border-[rgba(240,234,228,0.2)]'
      )}
    >
      {HIDDEN_STATUS_LABEL[status]}
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
  return <span className={cn(TAG, 'bg-[rgba(208,129,85,0.18)] text-ember')}>리더</span>
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

/**
 * 좋아요·댓글 줄 (C 담당).
 *
 * `targetType`·`targetId` 를 주면 좋아요를 토글하고 댓글을 펼쳐 쓰고 지울 수 있다. 주지 않으면 숫자만
 * 보여 준다(목 데이터 화면용). 처음 숫자는 목록 응답에서 받아 오고, 누른 뒤에는 서버가 돌려준 값으로 바꾼다.
 */
export function ReactionBar({
  targetType,
  targetId,
  likeCount,
  commentCount,
  likedByMe = false,
  children
}: {
  targetType?: ClubTargetType
  targetId?: number
  likeCount: number
  commentCount: number
  likedByMe?: boolean
  children?: ReactNode
}) {
  const { apiClient } = useAuthenticatedApi()
  const live = targetType !== undefined && targetId !== undefined
  const [liked, setLiked] = useState(likedByMe)
  const [likes, setLikes] = useState(likeCount)
  const [commentTotal, setCommentTotal] = useState(commentCount)
  const [open, setOpen] = useState(false)
  const [comments, setComments] = useState<ClubComment[] | null>(null)
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)

  const loadComments = useCallback(() => {
    if (targetType === undefined || targetId === undefined) return
    fetchClubComments(apiClient, targetType, targetId)
      .then((list) => {
        setComments(list)
        setCommentTotal(list.length)
      })
      .catch((err) => window.alert(readClubError(err, '댓글을 불러오지 못했어요.')))
  }, [apiClient, targetType, targetId])

  useEffect(() => {
    if (open && comments === null) loadComments()
  }, [open, comments, loadComments])

  const toggleLike = async () => {
    if (targetType === undefined || targetId === undefined || busy) return
    setBusy(true)
    try {
      const result = await setClubLike(apiClient, targetType, targetId, !liked)
      setLiked(result.liked)
      setLikes(result.likeCount)
    } catch (err) {
      window.alert(readClubError(err))
    } finally {
      setBusy(false)
    }
  }

  const submit = async () => {
    if (targetType === undefined || targetId === undefined || draft.trim() === '') return
    setBusy(true)
    try {
      await createClubComment(apiClient, targetType, targetId, draft.trim())
      setDraft('')
      loadComments()
    } catch (err) {
      window.alert(readClubError(err))
    } finally {
      setBusy(false)
    }
  }

  const remove = async (commentId: number) => {
    if (!window.confirm('댓글을 지울까요?')) return
    try {
      await deleteClubComment(apiClient, commentId)
      loadComments()
    } catch (err) {
      window.alert(readClubError(err))
    }
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-5 border-t border-dusk-line-soft pt-3 text-[13px]">
        <button
          type="button"
          onClick={toggleLike}
          disabled={busy}
          aria-pressed={liked}
          className={cn('min-h-9', liked ? 'text-ember' : 'text-dusk-ink-700')}
        >
          {liked ? '♥' : '♡'} 좋아요 {likes}
        </button>
        <button
          type="button"
          onClick={() => live && setOpen((prev) => !prev)}
          aria-expanded={open}
          className="min-h-9 text-dusk-ink-700"
        >
          댓글 {commentTotal}
        </button>
        {children}
      </div>
      {open && (
        <div className="flex flex-col gap-2.5 rounded-[14px] bg-[rgba(240,234,228,0.04)] px-3.5 py-3">
          {comments === null && <span className="text-sm text-dusk-ink-800">불러오는 중…</span>}
          {comments?.length === 0 && (
            <span className="text-sm text-dusk-ink-800">첫 댓글을 남겨 보세요.</span>
          )}
          {comments?.map((comment) => (
            <div key={comment.id} className="flex items-start gap-2 text-sm leading-[1.5]">
              <span className="shrink-0 font-semibold text-dusk-ink-400">{comment.authorName}</span>
              <span className="min-w-0 flex-1 whitespace-pre-line break-words text-dusk-ink-200">
                {comment.content}
              </span>
              {comment.deletable && (
                <button
                  type="button"
                  onClick={() => remove(comment.id)}
                  className="shrink-0 text-xs text-dusk-ink-800 hover:text-dusk-ink-100"
                >
                  삭제
                </button>
              )}
            </div>
          ))}
          <div className="flex gap-2">
            <input
              type="text"
              value={draft}
              maxLength={1000}
              placeholder="댓글 달기"
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing) void submit()
              }}
              className="min-h-10 min-w-0 flex-1 rounded-full border border-dusk-line bg-transparent px-4 text-sm outline-none focus:border-ember"
            />
            <button
              type="button"
              onClick={submit}
              disabled={busy || draft.trim() === ''}
              className="min-h-10 shrink-0 px-2 text-sm text-ember disabled:text-dusk-ink-800"
            >
              등록
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * 카카오톡 공유 버튼 (C 담당). 누르면 제목·설명·바로가기 링크가 채워진 카드가 만들어지고, 사용자가
 * 채팅방(공지 카톡방 등)을 골라 보낸다. 공식 공유 기능만 쓴다 — 단톡방 자동 발송은 공식 API 가 없다.
 *
 * 내용을 주지 않으면 지금 페이지의 제목과 주소를 쓴다.
 */
export function KakaoShareButton({
  title,
  description,
  imageUrl,
  path,
  compact = false,
  className
}: {
  title?: string
  description?: string
  imageUrl?: string | null
  path?: string
  compact?: boolean
  className?: string
}) {
  const disabled = !KAKAO_JS_KEY
  const share = async () => {
    try {
      await shareToKakao({
        title: title ?? document.title,
        description,
        imageUrl,
        path: path ?? `${window.location.pathname}${window.location.search}`
      })
    } catch (err) {
      window.alert(err instanceof Error ? err.message : '카카오톡으로 공유하지 못했어요.')
    }
  }
  const hint = disabled ? '카카오톡 공유가 아직 설정되지 않았어요' : undefined

  if (compact) {
    return (
      <button
        type="button"
        onClick={share}
        disabled={disabled}
        title={hint}
        className={cn('min-h-9 text-[13px] text-dusk-ink-700 disabled:opacity-50', className)}
      >
        카카오톡 공유
      </button>
    )
  }
  return (
    <button
      type="button"
      onClick={share}
      disabled={disabled}
      title={hint}
      className={cn(
        'inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full border border-[rgba(240,234,228,0.20)] px-5 text-sm text-dusk-ink-400 transition-colors hover:border-[rgba(240,234,228,0.5)] hover:text-dusk-ink-100 disabled:opacity-50',
        className
      )}
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
