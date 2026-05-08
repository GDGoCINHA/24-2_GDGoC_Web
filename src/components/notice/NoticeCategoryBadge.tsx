'use client'

import { NOTICE_CATEGORY_LABEL } from '@/constant/notice'
import type { NoticeCategory } from '@/services/notice/noticeApi'
import { cn } from '@/utils/cn'

const CATEGORY_STYLE: Record<NoticeCategory, string> = {
  OPERATION: 'bg-[#17386E] text-blue',
  SCHEDULE: 'bg-green-400 text-green',
  RECRUITMENT: 'bg-yellow-400 text-yellow',
  ETC: 'bg-gray-200 text-gray-700'
}

export interface NoticeCategoryBadgeProps {
  category: NoticeCategory
  className?: string
}

export const NoticeCategoryBadge = ({ category, className }: NoticeCategoryBadgeProps) => (
  <span
    className={cn(
      'inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-[800px] px-3 py-1 typo-c2',
      CATEGORY_STYLE[category],
      className
    )}
  >
    {NOTICE_CATEGORY_LABEL[category]}
  </span>
)
