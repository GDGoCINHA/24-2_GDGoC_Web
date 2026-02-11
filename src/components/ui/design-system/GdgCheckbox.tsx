'use client'

import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

export const GDG_CHECKBOX_SIZES = ['pc', 'mobile'] as const

export type GdgCheckboxProps = {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  size?: (typeof GDG_CHECKBOX_SIZES)[number]
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'>

const SIZE_CLASS: Record<'pc' | 'mobile', string> = {
  pc: 'size-[20px]',
  mobile: 'size-[18px]'
}

export function GdgCheckbox({
  checked = false,
  onCheckedChange,
  size = 'pc',
  className,
  disabled,
  ...rest
}: GdgCheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={(event) => {
        if (disabled) return
        rest.onClick?.(event)
        onCheckedChange?.(!checked)
      }}
      onKeyDown={(event) => {
        if (disabled) return
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onCheckedChange?.(!checked)
        }
        rest.onKeyDown?.(event)
      }}
      {...rest}
      className={cn(
        'inline-flex items-center justify-center rounded-md border transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40',
        SIZE_CLASS[size],
        checked ? 'border-red bg-red' : 'border-white',
        disabled && 'opacity-60 cursor-not-allowed',
        className
      )}
    >
      {checked && (
        <svg
          aria-hidden
          viewBox="0 0 20 20"
          className="size-[12px] text-white"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="m4 10 3 3 9-9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  )
}
