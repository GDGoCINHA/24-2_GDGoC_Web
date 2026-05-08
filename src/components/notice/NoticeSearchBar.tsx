'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Search } from 'lucide-react'

import { NoticeDropdown } from '@/components/notice/NoticeDropdown'
import { NOTICE_SEARCH_FIELD_LABEL } from '@/constant/notice'
import {
  NOTICE_SEARCH_FIELDS,
  type NoticeSearchField
} from '@/services/notice/noticeApi'
import { cn } from '@/utils/cn'

export interface NoticeSearchBarProps {
  initialQuery?: string
  initialField?: NoticeSearchField
  onSubmit: (query: string, field: NoticeSearchField) => void
  className?: string
}

export const NoticeSearchBar = ({
  initialQuery,
  initialField,
  onSubmit,
  className
}: NoticeSearchBarProps) => {
  const [query, setQuery] = useState(initialQuery ?? '')
  const [field, setField] = useState<NoticeSearchField>(initialField ?? 'title_content')

  // URL 변화로 인한 초기값 동기화 (뒤로가기 등)
  useEffect(() => {
    setQuery(initialQuery ?? '')
  }, [initialQuery])
  useEffect(() => {
    setField(initialField ?? 'title_content')
  }, [initialField])

  const fieldOptions = useMemo(
    () =>
      NOTICE_SEARCH_FIELDS.map((f) => ({
        id: f,
        label: NOTICE_SEARCH_FIELD_LABEL[f]
      })),
    []
  )

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit(query.trim(), field)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('flex w-[550px] items-center gap-4', className)}
    >
      <NoticeDropdown
        options={fieldOptions}
        value={field}
        onChange={(val) => setField(val as NoticeSearchField)}
      />
      <div className="flex h-11 flex-1 items-center justify-between rounded-full border border-gray-800 bg-black px-4 py-2.5 focus-within:ring-2 focus-within:ring-white/30">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="검색어를 입력하세요."
          className="min-w-0 flex-1 bg-transparent typo-b3 text-white outline-none placeholder:text-[#8C8C8C]"
        />
        <button
          type="submit"
          aria-label="검색"
          className="ml-2 text-white transition-colors hover:opacity-80"
        >
          <Search size={20} />
        </button>
      </div>
    </form>
  )
}
