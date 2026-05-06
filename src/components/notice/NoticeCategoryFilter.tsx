'use client'

import { NOTICE_CATEGORY_LABEL } from '@/constant/notice'
import { NOTICE_CATEGORIES, type NoticeCategory } from '@/services/notice/noticeApi'
import { cn } from '@/utils/cn'

export interface NoticeCategoryFilterProps {
  value?: NoticeCategory
  onChange: (next: NoticeCategory | undefined) => void
}

// 활성 상태(채움)와 비활성 상태(외곽선) 스타일을 카테고리별로 분리
const ACTIVE_STYLE: Record<NoticeCategory, string> = {
  OPERATION: 'bg-blue text-white border-transparent',
  SCHEDULE: 'bg-green text-white border-transparent',
  RECRUITMENT: 'bg-yellow text-white border-transparent',
  ETC: 'bg-white text-black border-transparent'
}

const INACTIVE_STYLE: Record<NoticeCategory, string> = {
  OPERATION: 'border-blue text-blue',
  SCHEDULE: 'border-green text-green',
  RECRUITMENT: 'border-yellow text-yellow',
  ETC: 'border-gray-800 text-gray-800'
}

const PILL_BASE =
  'inline-flex items-center justify-center rounded-full border-[1.5px] px-[14px] py-1 typo-b3 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40'

export const NoticeCategoryFilter = ({ value, onChange }: NoticeCategoryFilterProps) => {
  const allActive = value === undefined

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => onChange(undefined)}
        aria-pressed={allActive}
        className={cn(
          PILL_BASE,
          allActive
            ? 'bg-red text-white border-transparent'
            : 'border-red text-red'
        )}
      >
        전체
      </button>
      {NOTICE_CATEGORIES.map((cat) => {
        const selected = value === cat
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onChange(cat)}
            aria-pressed={selected}
            className={cn(
              PILL_BASE,
              selected ? ACTIVE_STYLE[cat] : INACTIVE_STYLE[cat]
            )}
          >
            {NOTICE_CATEGORY_LABEL[cat]}
          </button>
        )
      })}
    </div>
  )
}
