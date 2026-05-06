'use client'

import {
  GdgColorTag,
  type GdgTagColor,
  type GdgTagFill,
  type GdgTagSize
} from '@/components/ui/design-system'
import { NOTICE_CATEGORY_LABEL } from '@/constant/notice'
import type { NoticeCategory } from '@/services/notice/noticeApi'

const CATEGORY_TO_COLOR: Record<NoticeCategory, GdgTagColor> = {
  OPERATION: 'red',
  SCHEDULE: 'blue',
  RECRUITMENT: 'green',
  ETC: 'yellow'
}

export interface NoticeCategoryBadgeProps {
  category: NoticeCategory
  fill?: GdgTagFill
  size?: GdgTagSize
  className?: string
}

export const NoticeCategoryBadge = ({
  category,
  fill = 'on',
  size = 'mini',
  className
}: NoticeCategoryBadgeProps) => (
  <GdgColorTag
    color={CATEGORY_TO_COLOR[category]}
    fill={fill}
    size={size}
    className={className}
  >
    {NOTICE_CATEGORY_LABEL[category]}
  </GdgColorTag>
)
