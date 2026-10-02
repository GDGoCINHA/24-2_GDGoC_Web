'use client'

import { useState } from 'react'

import {
  ClubActivityStatusTag,
  ClubPhotoGrid,
  ClubPostCategoryTag,
  KakaoShareButton,
  ReactionBar
} from '@/components/club/ClubUi'
import { DUSK_CHIP, DUSK_CHIP_ACTIVE, DUSK_PRIMARY_BUTTON } from '@/components/ui/dusk/DuskForm'
import { MOCK_COMMENTS, MOCK_FEED } from '@/mock/clubMock'
import type { ClubMembership, ClubPostCategory } from '@/types/club'
import { CLUB_POST_CATEGORY_LABEL } from '@/types/club'
import { cn } from '@/utils/cn'

const POST_CATEGORIES: ClubPostCategory[] = ['QUESTION', 'REVIEW', 'RESOURCE', 'NOTICE']

/** 상세 「활동」 탭 (B 담당). 일반 게시글과 활동 기록을 최신순으로 섞어 보여준다. */
export function ClubFeedTab({
  clubId,
  myMembership
}: {
  clubId: number
  myMembership: ClubMembership | null
}) {
  const isMember = myMembership?.status === 'ACTIVE'
  const [category, setCategory] = useState<ClubPostCategory>('QUESTION')
  // TODO(B): GET /api/v1/clubs/{clubId}/feed 로 바꾼다.
  void clubId
  const feed = MOCK_FEED

  return (
    <div className="flex max-w-[760px] flex-col gap-[18px]">
      {isMember && (
        <div className="flex flex-col gap-3 rounded-[20px] border border-dusk-line bg-dusk-raise px-[18px] py-4">
          <label htmlFor="club-post-body" className="text-[13px] text-dusk-ink-700">
            팀에 글 남기기
          </label>
          <textarea
            id="club-post-body"
            rows={2}
            placeholder="질문, 후기, 자료를 공유해 보세요"
            className="resize-none bg-transparent text-[15px] text-dusk-ink-100 outline-none placeholder:text-dusk-ink-800 mobile:text-base"
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
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
            </div>
            <button type="button" className={cn(DUSK_PRIMARY_BUTTON, 'px-5 py-2')}>
              올리기
            </button>
          </div>
        </div>
      )}

      {feed.map((item) =>
        item.type === 'ACTIVITY' ? (
          <article
            key={`a-${item.id}`}
            className="overflow-hidden rounded-[20px] border border-dusk-line-soft bg-dusk-raise"
          >
            <div className="flex items-center justify-between gap-3 px-5 pb-3.5 pt-[18px]">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="inline-flex shrink-0 rounded-full bg-[rgba(208,129,85,0.18)] px-2.5 py-[3px] text-xs text-ember">
                  활동 기록
                </span>
                <span className="truncate text-[15px] font-semibold">{item.activityDate} 모임</span>
              </div>
              <ClubActivityStatusTag status={item.status} />
            </div>
            <ClubPhotoGrid urls={item.photoUrls} />
            <div className="flex flex-col gap-3 px-5 pb-[18px] pt-4">
              <p className="text-[15px] leading-[1.65] text-dusk-ink-200">{item.content}</p>
              <div className="flex flex-wrap gap-1.5 text-[13px] text-dusk-ink-700">
                <span>
                  참석 {item.attendedCount} / {item.rosterCount}명
                </span>
                <span className="text-dusk-ink-800">·</span>
                <span>
                  {item.attendedCount >= item.requiredCount
                    ? `필요 ${item.requiredCount}명 충족`
                    : `필요 ${item.requiredCount}명 미달`}
                </span>
                {isMember && item.attendeeNames && (
                  <>
                    <span className="text-dusk-ink-800">·</span>
                    <span>{item.attendeeNames.join(', ')}</span>
                  </>
                )}
              </div>
              <ReactionBar likeCount={item.likeCount} commentCount={item.commentCount}>
                <KakaoShareButton compact />
              </ReactionBar>
              {item.commentCount > 0 && (
                <div className="flex flex-col gap-2.5 rounded-[14px] bg-[rgba(240,234,228,0.04)] px-3.5 py-3">
                  {MOCK_COMMENTS.map((comment) => (
                    <div key={comment.content} className="text-sm leading-[1.5]">
                      <span className="mr-2 font-semibold text-dusk-ink-400">{comment.author}</span>
                      <span className="text-dusk-ink-200">{comment.content}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </article>
        ) : (
          <article
            key={`p-${item.id}`}
            className="flex flex-col gap-2.5 rounded-[20px] border border-dusk-line-soft bg-dusk-raise px-5 py-[18px]"
          >
            <div className="flex items-center gap-2.5">
              <ClubPostCategoryTag category={item.category} />
              <span className="text-sm text-dusk-ink-400">{item.authorName}</span>
              <span className="text-[13px] text-dusk-ink-800">{item.createdAt}</span>
            </div>
            <p className="text-[15px] leading-[1.65] text-dusk-ink-200">{item.content}</p>
            <ReactionBar likeCount={item.likeCount} commentCount={item.commentCount} />
          </article>
        )
      )}
    </div>
  )
}
