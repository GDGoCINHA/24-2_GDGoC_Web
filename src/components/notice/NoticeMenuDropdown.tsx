'use client'

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode
} from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { cn } from '@/utils/cn'

export interface NoticeMenuItem {
  label: string
  onClick: () => void
  /** 'danger'면 빨간 텍스트 (삭제 등 위험 액션) */
  variant?: 'default' | 'danger'
}

export interface NoticeMenuDropdownProps {
  /** 트리거 버튼 내부에 들어가는 컨텐츠 (보통 아이콘) */
  trigger: ReactNode
  items: NoticeMenuItem[]
  /** 트리거 button의 aria-label */
  triggerLabel?: string
  /** 메뉴 패널의 정렬 방향. 기본 'right' (트리거 우측에 정렬) */
  align?: 'left' | 'right'
  /** 트리거 button에 적용할 추가 클래스 */
  triggerClassName?: string
  /** 메뉴 패널 폭. 기본 'w-[122px]' */
  width?: string
  className?: string
}

/**
 * NoticeMenuDropdown
 *
 * 공지사항 도메인 전용 액션 메뉴 드롭다운 (수정/삭제 같은 액션 항목).
 * NoticeDropdown(select용)과 시각/모션 토큰을 공유하지만 API는 menu 액션 패턴.
 *
 * 사용처: NoticeDetailHeader의 더보기(점 3개) 메뉴
 */
export const NoticeMenuDropdown = ({
  trigger,
  items,
  triggerLabel,
  align = 'right',
  triggerClassName,
  width = 'w-[122px]',
  className
}: NoticeMenuDropdownProps) => {
  const [open, setOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState<number>(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  useEffect(() => {
    if (open) setFocusedIndex(0)
    else setFocusedIndex(-1)
  }, [open])

  useEffect(() => {
    if (focusedIndex < 0 || !listRef.current) return
    const el =
      listRef.current.querySelectorAll<HTMLElement>('[data-item-index]')[focusedIndex]
    el?.scrollIntoView({ block: 'nearest' })
  }, [focusedIndex])

  const close = () => {
    setOpen(false)
    triggerRef.current?.focus()
  }

  const runItem = (item: NoticeMenuItem) => {
    setOpen(false)
    item.onClick()
  }

  const handleTriggerKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowUp':
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (!open) setOpen(true)
        break
      case 'Escape':
        if (open) {
          e.preventDefault()
          setOpen(false)
        }
        break
    }
  }

  const handleListKeyDown = (e: ReactKeyboardEvent<HTMLUListElement>) => {
    if (!open) return
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex((i) => (i + 1) % items.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex((i) => (i - 1 + items.length) % items.length)
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (focusedIndex >= 0) runItem(items[focusedIndex])
        break
      case 'Escape':
        e.preventDefault()
        close()
        break
      case 'Tab':
        setOpen(false)
        break
      case 'Home':
        e.preventDefault()
        setFocusedIndex(0)
        break
      case 'End':
        e.preventDefault()
        setFocusedIndex(items.length - 1)
        break
    }
  }

  return (
    <div ref={wrapperRef} className={cn('relative', className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={triggerLabel}
        className={cn(
          'text-white outline-none transition-opacity hover:opacity-70 focus-visible:ring-2 focus-visible:ring-white/40',
          triggerClassName
        )}
      >
        {trigger}
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            ref={listRef}
            role="menu"
            tabIndex={-1}
            onKeyDown={handleListKeyDown}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{
              opacity: 1,
              scale: 1,
              transition: { type: 'spring', bounce: 0.4, duration: 0.5 }
            }}
            exit={{
              opacity: 0,
              scale: 0.85,
              transition: { duration: 0.15, ease: 'easeIn' }
            }}
            className={cn(
              'absolute top-[calc(100%+8px)] z-10 flex origin-top flex-col gap-1 rounded-xl border border-white/10 bg-gray-100 p-3 shadow-[0_20px_120px_rgba(0,0,0,0.75)] outline-none',
              align === 'right' ? 'right-0' : 'left-0',
              width
            )}
          >
            {items.map((item, idx) => {
              const focused = idx === focusedIndex
              const isDanger = item.variant === 'danger'
              return (
                <li key={item.label} role="none">
                  <button
                    type="button"
                    role="menuitem"
                    data-item-index={idx}
                    onClick={() => runItem(item)}
                    onMouseEnter={() => setFocusedIndex(idx)}
                    className={cn(
                      'flex h-9 w-full items-center rounded-lg px-2 typo-b2 outline-none transition-colors',
                      focused
                        ? isDanger
                          ? 'bg-white text-red'
                          : 'bg-white text-black'
                        : isDanger
                          ? 'text-red'
                          : 'text-white'
                    )}
                  >
                    {item.label}
                  </button>
                </li>
              )
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
