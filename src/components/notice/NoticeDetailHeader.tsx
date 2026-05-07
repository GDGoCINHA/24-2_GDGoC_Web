'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, MoreVertical, Share2 } from 'lucide-react'

import { NoticeCategoryBadge } from '@/components/notice/NoticeCategoryBadge'
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
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const onDocClick = (e: MouseEvent) => {
      if (!menuRootRef.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [menuOpen])

  return (
    <div ref={menuRootRef} className="relative flex w-full flex-col items-end gap-2">
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
        <div
          className="absolute right-[17px] top-[14px] flex items-center gap-2"
        >
          <button
            type="button"
            onClick={onShare}
            aria-label="공유"
            className="text-white transition-opacity hover:opacity-70"
          >
            <Share2 size={18} strokeWidth={2} />
          </button>
          {adminActions && (
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="더보기"
              className="text-white transition-opacity hover:opacity-70"
            >
              <MoreVertical size={18} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      {/* 더보기 드롭다운 — 관리자 전용 */}
      {adminActions && menuOpen && (
        <div
          role="menu"
          className="absolute right-0 top-[60px] z-10 flex w-[122px] flex-col rounded-[12px] bg-gray-100 py-2 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setMenuOpen(false)
              adminActions.onEdit()
            }}
            className="group flex w-full items-center px-2"
          >
            <span className="flex h-9 w-full items-center rounded-lg px-3 typo-b2 text-white transition-colors group-hover:bg-white group-hover:text-black">
              수정하기
            </span>
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setMenuOpen(false)
              adminActions.onDelete()
            }}
            className="group flex w-full items-center px-2"
          >
            <span className="flex h-9 w-full items-center rounded-lg px-3 typo-b2 text-red transition-colors group-hover:bg-white">
              삭제하기
            </span>
          </button>
        </div>
      )}

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
