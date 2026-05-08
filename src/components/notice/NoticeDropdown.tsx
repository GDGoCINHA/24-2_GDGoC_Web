'use client'

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent
} from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown } from 'lucide-react'

import { cn } from '@/utils/cn'

export interface NoticeDropdownOption {
  id: string
  label: string
}

export interface NoticeDropdownProps {
  options: NoticeDropdownOption[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  /**
   * 트리거 버튼 폭 (Tailwind 클래스).
   * 미지정 시 콘텐츠 크기에 맞춰 자동 사이징 (`w-fit` 트리거 / `w-max` 패널).
   * 명시적 폭이 필요하면 'w-[122px]' 또는 'w-full' 같은 클래스 전달.
   */
  width?: string
  disabled?: boolean
  className?: string
}

/**
 * NoticeDropdown
 *
 * 공지사항 도메인 전용 드롭다운 — 옵션 선택 전용 (타이핑 입력 X).
 * GdgDropdown(NextUI Autocomplete 기반)의 동적 동작들을 button 기반으로 재현:
 * - 화살표 회전 (열림 ↔ 닫힘)
 * - 트리거 호버/포커스 시 border 강조
 * - 키보드 내비 (↑/↓/Enter/Escape/Tab)
 * - 포커스된 항목 하이라이트
 * - 스프링 진입 + ease-in 종료 모션
 * - 선택 항목 체크 아이콘
 */
export const NoticeDropdown = ({
  options,
  value,
  onChange,
  placeholder = '선택하세요',
  width,
  disabled,
  className
}: NoticeDropdownProps) => {
  // width 미지정 시: 트리거는 콘텐츠 크기에 맞추고(w-fit), 패널은 가장 긴 항목에 맞춤(w-max)
  // → 좁은 화면에서도 줄바꿈 없이 안전하게 표시됨
  const triggerWidth = width ?? 'w-fit'
  const panelWidth = width ?? 'w-max'
  const [open, setOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState<number>(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const selectedIndex = options.findIndex((o) => o.id === value)
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : undefined

  // 외부 클릭 시 닫기
  useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  // 드롭다운 열릴 때 현재 선택된 항목으로 포커스 이동 (없으면 첫 항목)
  useEffect(() => {
    if (open) {
      setFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0)
    } else {
      setFocusedIndex(-1)
    }
    // selectedIndex는 의도적으로 의존성에서 빼서 열릴 때 한 번만 평가
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // 포커스된 항목이 바뀔 때 시야로 스크롤
  useEffect(() => {
    if (focusedIndex < 0 || !listRef.current) return
    const el = listRef.current.querySelectorAll<HTMLElement>('[data-option-index]')[focusedIndex]
    el?.scrollIntoView({ block: 'nearest' })
  }, [focusedIndex])

  const handleSelect = (id: string) => {
    onChange?.(id)
    setOpen(false)
    triggerRef.current?.focus()
  }

  const handleTriggerKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowUp':
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (!open) {
          setOpen(true)
        }
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
        setFocusedIndex((i) => (i + 1) % options.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex((i) => (i - 1 + options.length) % options.length)
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (focusedIndex >= 0) handleSelect(options[focusedIndex].id)
        break
      case 'Escape':
        e.preventDefault()
        setOpen(false)
        triggerRef.current?.focus()
        break
      case 'Tab':
        // Tab으로 빠져나갈 땐 닫고 트리거에 포커스 안 맡기고 자연 흐름 유지
        setOpen(false)
        break
      case 'Home':
        e.preventDefault()
        setFocusedIndex(0)
        break
      case 'End':
        e.preventDefault()
        setFocusedIndex(options.length - 1)
        break
    }
  }

  return (
    <div ref={wrapperRef} className={cn('relative', className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => !disabled && setOpen((v) => !v)}
        onKeyDown={handleTriggerKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          'flex h-11 shrink-0 items-center justify-between rounded-full border bg-black px-4 py-2 typo-b3 text-white outline-none transition-colors duration-150',
          'hover:border-gray-700 focus-visible:ring-2 focus-visible:ring-white/40',
          open ? 'border-white' : 'border-gray-800',
          'disabled:cursor-not-allowed disabled:border-gray-100 disabled:bg-gray-100 disabled:text-white/40 disabled:hover:border-gray-100',
          triggerWidth
        )}
      >
        <span
          className={cn(
            'whitespace-nowrap',
            selectedOption ? 'text-white' : 'text-gray-700'
          )}
        >
          {selectedOption?.label ?? placeholder}
        </span>
        {/* 열림 ↔ 닫힘 시 화살표 180도 회전 */}
        <ChevronDown
          size={12}
          className={cn(
            'ml-2 shrink-0 text-white transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            ref={listRef}
            role="listbox"
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
              'absolute left-0 top-[52px] z-10 flex origin-top flex-col gap-1 rounded-xl border border-white/10 bg-gray-100 p-3 shadow-[0_20px_120px_rgba(0,0,0,0.75)] outline-none',
              panelWidth
            )}
          >
            {options.map((opt, idx) => {
              const selected = opt.id === value
              const focused = idx === focusedIndex
              return (
                <li key={opt.id} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    data-option-index={idx}
                    onClick={() => handleSelect(opt.id)}
                    onMouseEnter={() => setFocusedIndex(idx)}
                    className={cn(
                      'flex h-9 w-full items-center justify-between gap-2 whitespace-nowrap rounded-lg px-2 typo-b2 outline-none transition-colors',
                      // 포커스(키보드/호버) 상태 — GdgDropdown과 동일하게 흰 배경 + 검정 텍스트
                      focused ? 'bg-white text-black' : 'text-white'
                    )}
                  >
                    <span>{opt.label}</span>
                    {selected && <Check size={12} strokeWidth={2.4} />}
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
