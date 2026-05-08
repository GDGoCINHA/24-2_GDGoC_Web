'use client'

import { ChevronLeft, MoreVertical, Share2 } from 'lucide-react'

import { NoticeCategoryBadge } from '@/components/notice/NoticeCategoryBadge'
import { NoticeMenuDropdown } from '@/components/notice/NoticeMenuDropdown'
import type { Notice } from '@/services/notice/noticeApi'

const formatLongDate = (iso: string): string => {
  const d = new Date(iso)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}.${mm}.${dd}.`
}

export interface NoticeDetailAdminActions {
  onEdit: () => void
  onDelete: () => void
}

export interface NoticeDetailHeaderProps {
  notice: Notice
  onBack: () => void
  onShare?: () => void
  adminActions?: NoticeDetailAdminActions
}

export const NoticeDetailHeader = ({
  notice,
  onBack,
  onShare,
  adminActions
}: NoticeDetailHeaderProps) => {
  return (
    <div className="relative flex w-full flex-col items-end gap-2">
      {/* 제목 알약 바 — flex 레이아웃으로 좌(뒤로) / 중(뱃지+제목) / 우(공유+더보기) 영역 분리.
          제목 길이 초과 시 자기 영역 안에서만 줄바꿈 → 우측 아이콘과 겹치지 않음. */}
      <div className="flex min-h-12 w-full items-start gap-2 rounded-full border border-gray-800 py-3 pl-[7px] pr-[14px] pc:pl-[15px] pc:pr-[17px]">
        <button
          type="button"
          onClick={onBack}
          aria-label="뒤로 가기"
          className="flex size-6 shrink-0 items-center justify-center text-white transition-opacity hover:opacity-70"
        >
          <ChevronLeft size={18} strokeWidth={2.4} />
        </button>
        <div className="flex min-h-6 min-w-0 flex-1 items-center justify-center gap-2">
          <NoticeCategoryBadge category={notice.category} />
          <p className="min-w-0 break-words typo-pc-b1 text-white mobile:typo-m-b2">
            {notice.title}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onShare}
            aria-label="공유"
            className="flex size-6 items-center justify-center text-white transition-opacity hover:opacity-70"
          >
            <Share2 size={18} strokeWidth={2} />
          </button>
          {adminActions && (
            <NoticeMenuDropdown
              triggerLabel="더보기"
              trigger={<MoreVertical size={18} strokeWidth={2} />}
              items={[
                { label: '수정하기', onClick: adminActions.onEdit },
                { label: '삭제하기', onClick: adminActions.onDelete, variant: 'danger' }
              ]}
            />
          )}
        </div>
      </div>

      {/* 메타 정보 — PC: 단일 row / 모바일: 2 rows (작성자+조회수 / 작성일+최종 수정일) */}
      <div className="hidden items-center gap-6 pr-4 typo-b3 text-white pc:flex">
        <p>작성자: {notice.author.team ?? notice.author.name}</p>
        <p>작성일: {formatLongDate(notice.createdAt)}</p>
        <p>최종 수정일: {formatLongDate(notice.updatedAt)}</p>
        <p>조회수: {notice.viewCount}</p>
      </div>
      <div className="flex flex-col items-end gap-1 pr-2 typo-m-c2 text-white pc:hidden">
        <div className="flex items-center gap-4">
          <p>작성자: {notice.author.team ?? notice.author.name}</p>
          <p>조회수: {notice.viewCount}</p>
        </div>
        <div className="flex items-center gap-4">
          <p>작성일: {formatLongDate(notice.createdAt)}</p>
          <p>최종 수정일: {formatLongDate(notice.updatedAt)}</p>
        </div>
      </div>
    </div>
  )
}
