'use client'

import { NoticeCategoryBadge } from '@/components/notice/NoticeCategoryBadge'
import { NOTICE_CATEGORIES, type NoticeCategory } from '@/services/notice/noticeApi'

export interface NoticeCategoryFilterProps {
  value?: NoticeCategory
  onChange: (next: NoticeCategory | undefined) => void
}

export const NoticeCategoryFilter = ({ value, onChange }: NoticeCategoryFilterProps) => (
  <div className="flex flex-wrap gap-2">
    {NOTICE_CATEGORIES.map((cat) => {
      const selected = value === cat
      return (
        <button
          key={cat}
          type="button"
          onClick={() => onChange(selected ? undefined : cat)}
          aria-pressed={selected}
          className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded-full"
        >
          <NoticeCategoryBadge category={cat} fill={selected ? 'on' : 'off'} size="pc" />
        </button>
      )
    })}
  </div>
)
