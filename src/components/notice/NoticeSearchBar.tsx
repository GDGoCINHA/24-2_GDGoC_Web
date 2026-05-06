'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'

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

const FIELD_BUTTON_CLASS =
  'flex h-11 w-[122px] items-center justify-between rounded-full border border-gray-800 bg-black px-4 py-2 typo-b3 text-white outline-none focus-visible:ring-2 focus-visible:ring-white/40'

export const NoticeSearchBar = ({
  initialQuery,
  initialField,
  onSubmit,
  className
}: NoticeSearchBarProps) => {
  const [query, setQuery] = useState(initialQuery ?? '')
  const [field, setField] = useState<NoticeSearchField>(initialField ?? 'title_content')
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // URL 변화로 인한 초기값 동기화 (뒤로가기 등)
  useEffect(() => {
    setQuery(initialQuery ?? '')
  }, [initialQuery])
  useEffect(() => {
    setField(initialField ?? 'title_content')
  }, [initialField])

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit(query.trim(), field)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('flex w-[550px] items-center gap-4', className)}
    >
      <div ref={wrapperRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={FIELD_BUTTON_CLASS}
        >
          <span>{NOTICE_SEARCH_FIELD_LABEL[field]}</span>
          <ChevronDown size={12} className="text-white" />
        </button>
        {open && (
          <ul
            role="listbox"
            className="absolute left-0 top-[52px] z-10 flex w-[122px] flex-col rounded-[12px] bg-gray-100 py-2 shadow-lg"
          >
            {NOTICE_SEARCH_FIELDS.map((f) => {
              const selected = field === f
              return (
                <li key={f} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onClick={() => {
                      setField(f)
                      setOpen(false)
                    }}
                    className="group flex w-full items-center px-2"
                  >
                    <span className="flex h-9 w-full items-center justify-between rounded-lg px-3 typo-b2 text-white transition-colors group-hover:bg-white group-hover:text-black">
                      <span>{NOTICE_SEARCH_FIELD_LABEL[f]}</span>
                      {selected && <Check size={12} strokeWidth={2.4} />}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
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
