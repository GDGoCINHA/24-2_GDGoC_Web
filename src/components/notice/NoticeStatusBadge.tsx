'use client'

import { NOTICE_STATUS_LABEL } from '@/constant/notice'
import type { NoticeStatus } from '@/services/notice/noticeApi'
import { cn } from '@/utils/cn'

// 와이어프레임의 상태 배지 — 어두운 배경 + 같은 색 계열의 밝은 글자
const STATUS_STYLE: Record<NoticeStatus, string> = {
  PUBLISHED: 'bg-[#17386E] text-[#4285F4]',
  IN_PROGRESS: 'bg-[#165A28] text-[#34A853]',
  CLOSED: 'bg-[#674C14] text-[#F9AB00]',
  DRAFT: 'bg-[#424242] text-[#B2B2B2]'
}

export interface NoticeStatusBadgeProps {
  status: NoticeStatus
  className?: string
}

export const NoticeStatusBadge = ({ status, className }: NoticeStatusBadgeProps) => (
  <span
    className={cn(
      'inline-flex h-[22px] items-center justify-center rounded-full px-2.5 text-[12px] font-medium leading-none',
      STATUS_STYLE[status],
      className
    )}
  >
    {NOTICE_STATUS_LABEL[status]}
  </span>
)
