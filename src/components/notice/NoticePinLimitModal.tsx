'use client'

import { useState } from 'react'

import { NoticeCategoryBadge } from '@/components/notice/NoticeCategoryBadge'
import { GdgCheckbox } from '@/components/ui/design-system'
import type { Notice, NoticeCategory } from '@/services/notice/noticeApi'
import { cn } from '@/utils/cn'

const formatShortDate = (iso: string): string => {
  const d = new Date(iso)
  const yy = String(d.getFullYear()).slice(2)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yy}.${mm}.${dd}.`
}

const padNumber = (n: number): string => String(n).padStart(3, '0')

interface PinCardData {
  category: NoticeCategory
  title: string
  authorName: string
  createdAt: string
  viewCount: number
}

interface PinCardProps {
  data: PinCardData
  checked: boolean
  onToggle: () => void
}

const PinCard = ({ data, checked, onToggle }: PinCardProps) => (
  <div className="relative h-[72px] w-full overflow-hidden rounded-lg bg-gray-200">
    <div className="absolute left-4 top-[calc(50%-12px)] flex -translate-y-1/2 items-center gap-2">
      <NoticeCategoryBadge category={data.category} />
      <p className="w-[398px] truncate typo-b2 text-white">{data.title}</p>
    </div>
    <div className="absolute left-[68px] top-[calc(50%+12px)] flex -translate-y-1/2 items-center gap-6 whitespace-nowrap typo-b3 text-gray-700">
      <span>{data.authorName}</span>
      <span>{formatShortDate(data.createdAt)}</span>
      <span>{padNumber(data.viewCount)}</span>
    </div>
    <GdgCheckbox
      checked={checked}
      onCheckedChange={() => onToggle()}
      className="absolute right-4 top-1/2 -translate-y-1/2"
    />
  </div>
)

export interface NoticePinLimitModalProps {
  pinnedNotices: Notice[]
  newDraft: PinCardData
  onCancel: () => void
  onConfirm: (unpinTargetId: string) => void
}

export const NoticePinLimitModal = ({
  pinnedNotices,
  newDraft,
  onCancel,
  onConfirm
}: NoticePinLimitModalProps) => {
  // 기본 상태: 기존 핀 모두 체크, 새 게시글 미체크
  const [keptIds, setKeptIds] = useState<Set<string>>(
    new Set(pinnedNotices.map((p) => p.id))
  )
  const [newChecked, setNewChecked] = useState(false)

  const toggleExisting = (id: string) => {
    setKeptIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // 정확히 3개 체크 + 새 게시글 포함이어야 등록 가능
  const totalChecked = keptIds.size + (newChecked ? 1 : 0)
  const canSubmit = totalChecked === 3 && newChecked

  const handlePrimary = () => {
    if (!canSubmit) {
      onCancel()
      return
    }
    // 체크 해제된 기존 핀이 unpin 대상 — 정확히 1개여야 함
    const unpinTarget = pinnedNotices.find((p) => !keptIds.has(p.id))
    if (!unpinTarget) {
      onCancel()
      return
    }
    onConfirm(unpinTarget.id)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-[550px] rounded-2xl bg-gray-100 p-4"
      >
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-1 text-white">
            <h2 className="typo-h5">최대 3개의 게시글까지 고정할 수 있습니다.</h2>
            <p className="typo-b2">상단에서 내릴 공지를 선택해 주세요.</p>
          </div>

          {/* 기존 핀 카드들 */}
          <div className="flex flex-col gap-2">
            {pinnedNotices.map((p) => (
              <PinCard
                key={p.id}
                data={{
                  category: p.category,
                  title: p.title,
                  authorName: p.author.name,
                  createdAt: p.createdAt,
                  viewCount: p.viewCount
                }}
                checked={keptIds.has(p.id)}
                onToggle={() => toggleExisting(p.id)}
              />
            ))}
          </div>

          {/* 새 게시글 카드 */}
          <PinCard
            data={newDraft}
            checked={newChecked}
            onToggle={() => setNewChecked((v) => !v)}
          />

          {/* 하단 버튼 — 등록 가능하면 빨강, 아니면 회색 취소 */}
          <button
            type="button"
            onClick={handlePrimary}
            className={cn(
              'w-full rounded-full py-3.5 typo-b2 text-white transition-opacity hover:opacity-90',
              canSubmit ? 'bg-red' : 'bg-gray-200'
            )}
          >
            {canSubmit ? '등록' : '취소'}
          </button>
        </div>
      </div>
    </div>
  )
}
