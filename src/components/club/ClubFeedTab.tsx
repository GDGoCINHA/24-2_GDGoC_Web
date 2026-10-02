'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

import { formatActivityDate, formatScheduleTime } from '@/components/club/clubDate'
import {
  ClubActivityStatusTag,
  ClubPhotoGrid,
  ClubPostCategoryTag,
  KakaoShareButton,
  ReactionBar
} from '@/components/club/ClubUi'
import {
  DUSK_CHIP,
  DUSK_CHIP_ACTIVE,
  DUSK_GHOST_BUTTON,
  DUSK_PRIMARY_BUTTON,
  DUSK_TEXTAREA
} from '@/components/ui/dusk/DuskForm'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import {
  describeUploadError,
  requestPresignedUpload,
  toPublicUrl,
  uploadFileToS3,
  validateUploadSize
} from '@/services/board/uploadClient'
import { readClubError } from '@/services/club/clubClient'
import {
  POST_IMAGE_S3_KEY,
  createPost,
  deletePost,
  fetchTeamFeed,
  updatePost
} from '@/services/club/feedClient'
import type { ClubFeedItem, ClubMembership, ClubPostCategory } from '@/types/club'
import { CLUB_POST_CATEGORY_LABEL } from '@/types/club'
import { cn } from '@/utils/cn'

const POST_CATEGORIES: ClubPostCategory[] = ['QUESTION', 'REVIEW', 'RESOURCE', 'NOTICE']
/** 서버 `ClubPostRequest` 의 사진 최대 개수. */
const MAX_POST_IMAGES = 4

/**
 * 상세 「활동」 탭 (B 담당). 일반 게시글과 활동 기록을 올라온 시각 최신순으로 섞어 보여준다.
 *
 * 부원이면 누구나 읽고, 팀 멤버만 글을 쓴다. 활동 기록 카드에는 출석 명단 없이 인원 수만 나온다.
 */
export function ClubFeedTab({
  clubId,
  myMembership
}: {
  clubId: number
  myMembership: ClubMembership | null
}) {
  const { apiClient } = useAuthenticatedApi()
  const isMember = myMembership?.status === 'ACTIVE'
  const [items, setItems] = useState<ClubFeedItem[] | null>(null)
  const [page, setPage] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)

  /** 처음부터 다시 받는다. 글을 쓰거나 지운 뒤에 부른다. */
  const reload = useCallback(() => {
    fetchTeamFeed(apiClient, clubId, 0)
      .then(({ items: first, meta }) => {
        setItems(first)
        setPage(0)
        setHasNext(meta.hasNext)
        setError(null)
      })
      .catch((err) => setError(readClubError(err, '활동을 불러오지 못했어요.')))
  }, [apiClient, clubId])

  useEffect(reload, [reload])

  const loadMore = async () => {
    setLoadingMore(true)
    try {
      const { items: more, meta } = await fetchTeamFeed(apiClient, clubId, page + 1)
      setItems((prev) => [...(prev ?? []), ...more])
      setPage(page + 1)
      setHasNext(meta.hasNext)
    } catch (err) {
      window.alert(readClubError(err, '더 불러오지 못했어요.'))
    } finally {
      setLoadingMore(false)
    }
  }

  return (
    <div className="flex max-w-[760px] flex-col gap-[18px]">
      {isMember && <PostComposer clubId={clubId} onPosted={reload} />}

      {error && <p className="py-8 text-center text-sm text-dusk-ink-800">{error}</p>}
      {!error && !items && (
        <p className="py-8 text-center text-sm text-dusk-ink-800">불러오는 중…</p>
      )}
      {items?.length === 0 && (
        <p className="py-8 text-center text-sm text-dusk-ink-800">아직 올라온 활동이 없어요.</p>
      )}

      {items?.map((item) =>
        item.type === 'ACTIVITY' ? (
          <ActivityCard key={`a-${item.id}`} clubId={clubId} item={item} />
        ) : (
          <PostCard key={`p-${item.id}`} clubId={clubId} item={item} onChanged={reload} />
        )
      )}

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

/** 팀 멤버의 글쓰기. 분류·내용·사진(선택). */
function PostComposer({ clubId, onPosted }: { clubId: number; onPosted: () => void }) {
  const { apiClient } = useAuthenticatedApi()
  const [category, setCategory] = useState<ClubPostCategory>('QUESTION')
  const [content, setContent] = useState('')
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [posting, setPosting] = useState(false)

  const upload = async (files: FileList | null) => {
    if (!files) return
    setUploading(true)
    try {
      for (const file of Array.from(files).slice(0, MAX_POST_IMAGES - imageUrls.length)) {
        const sizeError = validateUploadSize(file)
        if (sizeError) {
          window.alert(sizeError)
          continue
        }
        const { uploadUrl } = await requestPresignedUpload(apiClient, file, POST_IMAGE_S3_KEY)
        await uploadFileToS3(uploadUrl, file)
        const url = toPublicUrl(uploadUrl)
        setImageUrls((prev) => [...prev, url])
      }
    } catch (err) {
      window.alert(describeUploadError(err))
    } finally {
      setUploading(false)
    }
  }

  const submit = async () => {
    if (!content.trim()) return
    setPosting(true)
    try {
      await createPost(apiClient, clubId, { category, content: content.trim(), imageUrls })
      setContent('')
      setImageUrls([])
      onPosted()
    } catch (err) {
      window.alert(readClubError(err, '글을 올리지 못했어요.'))
    } finally {
      setPosting(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-[20px] border border-dusk-line bg-dusk-raise px-[18px] py-4">
      <label htmlFor="club-post-body" className="text-[13px] text-dusk-ink-700">
        팀에 글 남기기
      </label>
      <textarea
        id="club-post-body"
        rows={2}
        maxLength={5000}
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="질문, 후기, 자료를 공유해 보세요"
        className="resize-none bg-transparent text-[15px] text-dusk-ink-100 outline-none placeholder:text-dusk-ink-800 mobile:text-base"
      />
      {imageUrls.length > 0 && (
        <div className="flex gap-2">
          {imageUrls.map((url, index) => (
            <div key={url} className="relative size-16 overflow-hidden rounded-lg bg-dusk-slot">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`첨부 사진 ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                aria-label={`첨부 사진 ${index + 1} 빼기`}
                onClick={() => setImageUrls((prev) => prev.filter((u) => u !== url))}
                className="absolute right-0.5 top-0.5 flex size-5 items-center justify-center rounded-full bg-[rgba(27,22,34,0.8)] text-xs text-dusk-ink-200"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {POST_CATEGORIES.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setCategory(value)}
              className={cn(
                category === value ? DUSK_CHIP_ACTIVE : DUSK_CHIP,
                'min-h-9 px-3 py-1.5 text-xs'
              )}
            >
              {CLUB_POST_CATEGORY_LABEL[value]}
            </button>
          ))}
          {imageUrls.length < MAX_POST_IMAGES && (
            <label
              className={cn(
                'min-h-9 cursor-pointer px-2 text-xs leading-9 text-dusk-ink-700',
                uploading && 'cursor-wait opacity-60'
              )}
            >
              {uploading ? '올리는 중…' : '+ 사진'}
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={uploading}
                className="sr-only"
                onChange={(event) => {
                  void upload(event.target.files)
                  event.target.value = ''
                }}
              />
            </label>
          )}
        </div>
        <button
          type="button"
          disabled={posting || uploading || !content.trim()}
          onClick={() => void submit()}
          className={cn(DUSK_PRIMARY_BUTTON, 'px-5 py-2 disabled:opacity-50')}
        >
          {posting ? '올리는 중…' : '올리기'}
        </button>
      </div>
      <p className="text-xs text-dusk-ink-800">사진은 로그인한 부원 전체에게 공개돼요</p>
    </div>
  )
}

function ActivityCard({ clubId, item }: { clubId: number; item: ClubFeedItem }) {
  const href = `/club/activity/?clubId=${clubId}&id=${item.id}`
  const date = item.activityDate ? formatActivityDate(item.activityDate) : ''
  const attended = item.attendedCount ?? 0
  const required = item.requiredCount ?? 0
  return (
    <article className="overflow-hidden rounded-[20px] border border-dusk-line-soft bg-dusk-raise">
      <div className="flex items-center justify-between gap-3 px-5 pb-3.5 pt-[18px]">
        <Link href={href} className="flex min-w-0 items-center gap-2.5">
          <span className="inline-flex shrink-0 rounded-full bg-[rgba(208,129,85,0.18)] px-2.5 py-[3px] text-xs text-ember">
            활동 기록
          </span>
          <span className="truncate text-[15px] font-semibold">{date} 모임</span>
        </Link>
        {item.status && <ClubActivityStatusTag status={item.status} />}
      </div>
      <Link href={href}>
        <ClubPhotoGrid urls={item.photoUrls ?? []} />
      </Link>
      <div className="flex flex-col gap-3 px-5 pb-[18px] pt-4">
        <p className="whitespace-pre-line text-[15px] leading-[1.65] text-dusk-ink-200">
          {item.content}
        </p>
        <div className="flex flex-wrap gap-1.5 text-[13px] text-dusk-ink-700">
          <span>
            참석 {attended} / {item.rosterCount ?? 0}명
          </span>
          <span className="text-dusk-ink-800">·</span>
          <span>
            필요 {required}명 {attended >= required ? '충족' : '미달'}
          </span>
        </div>
        <ReactionBar
          targetType="ACTIVITY"
          targetId={item.id}
          likeCount={item.likeCount}
          commentCount={item.commentCount}
          likedByMe={item.likedByMe}
        >
          <KakaoShareButton
            compact
            title={`${date} 활동 기록`}
            description={item.content.slice(0, 80)}
            imageUrl={item.photoUrls?.[0] ?? null}
            path={href}
          />
        </ReactionBar>
      </div>
    </article>
  )
}

function PostCard({
  clubId,
  item,
  onChanged
}: {
  clubId: number
  item: ClubFeedItem
  onChanged: () => void
}) {
  const { apiClient } = useAuthenticatedApi()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(item.content)
  const [busy, setBusy] = useState(false)

  const save = async () => {
    if (!draft.trim() || !item.category) return
    setBusy(true)
    try {
      await updatePost(apiClient, clubId, item.id, {
        category: item.category,
        content: draft.trim(),
        imageUrls: item.imageUrls ?? []
      })
      setEditing(false)
      onChanged()
    } catch (err) {
      window.alert(readClubError(err, '고치지 못했어요.'))
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (!window.confirm('이 글을 지울까요?')) return
    setBusy(true)
    try {
      await deletePost(apiClient, clubId, item.id)
      onChanged()
    } catch (err) {
      window.alert(readClubError(err, '지우지 못했어요.'))
      setBusy(false)
    }
  }

  return (
    <article className="flex flex-col gap-2.5 rounded-[20px] border border-dusk-line-soft bg-dusk-raise px-5 py-[18px]">
      <div className="flex items-center gap-2.5">
        {item.category && <ClubPostCategoryTag category={item.category} />}
        <span className="text-sm text-dusk-ink-400">{item.authorName}</span>
        <span className="text-[13px] text-dusk-ink-800">{formatScheduleTime(item.createdAt)}</span>
        {(item.editable || item.deletable) && !editing && (
          <span className="ml-auto flex gap-3 text-[13px]">
            {item.editable && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="min-h-9 text-dusk-ink-700"
              >
                수정
              </button>
            )}
            {item.deletable && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void remove()}
                className="min-h-9 text-dusk-ink-700"
              >
                삭제
              </button>
            )}
          </span>
        )}
      </div>

      {editing ? (
        <div className="flex flex-col gap-2">
          <textarea
            rows={3}
            maxLength={5000}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            className={DUSK_TEXTAREA}
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setDraft(item.content)
                setEditing(false)
              }}
              className={cn(DUSK_GHOST_BUTTON, 'px-4 py-2 text-[13px]')}
            >
              취소
            </button>
            <button
              type="button"
              disabled={busy || !draft.trim()}
              onClick={() => void save()}
              className={cn(DUSK_PRIMARY_BUTTON, 'px-4 py-2 text-[13px] disabled:opacity-50')}
            >
              저장
            </button>
          </div>
        </div>
      ) : (
        <p className="whitespace-pre-line text-[15px] leading-[1.65] text-dusk-ink-200">
          {item.content}
        </p>
      )}

      {item.imageUrls && item.imageUrls.length > 0 && (
        <div className="grid grid-cols-2 gap-1.5">
          {item.imageUrls.map((url, index) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="aspect-[4/3] overflow-hidden rounded-xl bg-dusk-slot"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`첨부 사진 ${index + 1}`}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </a>
          ))}
        </div>
      )}

      <ReactionBar
        targetType="POST"
        targetId={item.id}
        likeCount={item.likeCount}
        commentCount={item.commentCount}
        likedByMe={item.likedByMe}
      />
    </article>
  )
}
