'use client'

import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

export type GdgRadioProps = {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  size?: 'pc' | 'mobile'
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'>

const SIZE_CLASS: Record<'pc' | 'mobile', string> = {
  pc: 'size-[20px]',
  mobile: 'size-[18px]'
}

export function GdgRadio({
  checked = false,
  onCheckedChange,
  size = 'pc',
  className,
  disabled,
  ...rest
}: GdgRadioProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      disabled={disabled}
      onClick={(event) => {
        if (disabled || checked) return
        rest.onClick?.(event)
        onCheckedChange?.(true)
      }}
      onKeyDown={(event) => {
        if (disabled) return
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          if (!checked) onCheckedChange?.(true)
        }
        rest.onKeyDown?.(event)
      }}
      {...rest}
      className={cn(
        'inline-flex items-center justify-center rounded-full border transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40',
        SIZE_CLASS[size],
        checked ? 'border-red' : 'border-white',
        disabled && 'opacity-60 cursor-not-allowed',
        className
      )}
    >
      {checked && <span className="size-[8px] rounded-full bg-red" aria-hidden />}
    </button>
  )
}
