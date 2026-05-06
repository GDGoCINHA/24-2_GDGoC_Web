'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { Search } from 'lucide-react'

import { NOTICE_SEARCH_FIELD_LABEL } from '@/constant/notice'
import {
  NOTICE_SEARCH_FIELDS,
  type NoticeSearchField
} from '@/services/notice/noticeApi'

export interface NoticeSearchBarProps {
  initialQuery?: string
  initialField?: NoticeSearchField
  onSubmit: (query: string, field: NoticeSearchField) => void
}

export const NoticeSearchBar = ({
  initialQuery,
  initialField,
  onSubmit
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit(query.trim(), field)
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <select
        value={field}
        onChange={(e) => setField(e.target.value as NoticeSearchField)}
        className="h-10 rounded-full border border-white/30 bg-transparent px-4 text-sm text-white outline-none"
      >
        {NOTICE_SEARCH_FIELDS.map((f) => (
          <option key={f} value={f} className="bg-[#1e1e1e]">
            {NOTICE_SEARCH_FIELD_LABEL[f]}
          </option>
        ))}
      </select>
      <div className="flex h-10 items-center gap-2 rounded-full border border-white/30 px-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="검색어를 입력하세요."
          className="w-[260px] bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
        />
        <button
          type="submit"
          aria-label="검색"
          className="text-gray-300 transition-colors hover:text-white"
        >
          <Search size={18} />
        </button>
      </div>
    </form>
  )
}
