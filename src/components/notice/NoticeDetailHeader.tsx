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
      {/* 제목 알약 바 */}
      <div className="relative h-12 w-full rounded-full border border-gray-800">
        <button
          type="button"
          onClick={onBack}
          aria-label="뒤로 가기"
          className="absolute left-[15px] top-1/2 flex size-6 -translate-y-1/2 items-center justify-center text-white transition-opacity hover:opacity-70"
        >
          <ChevronLeft size={18} strokeWidth={2.4} />
        </button>
        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2">
          <NoticeCategoryBadge category={notice.category} />
          <p className="typo-b1 text-white">{notice.title}</p>
        </div>
        <div className="absolute right-[17px] top-[14px] flex items-center gap-2">
          <button
            type="button"
            onClick={onShare}
            aria-label="공유"
            className="text-white transition-opacity hover:opacity-70"
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

      {/* 메타 정보 */}
      <div className="flex items-center gap-6 pr-4 typo-b3 text-white">
        <p>작성자: {notice.author.team ?? notice.author.name}</p>
        <p>작성일: {formatLongDate(notice.createdAt)}</p>
        <p>최종 수정일: {formatLongDate(notice.updatedAt)}</p>
        <p>조회수: {notice.viewCount}</p>
      </div>
    </div>
  )
}
