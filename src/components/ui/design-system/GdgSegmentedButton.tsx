'use client'

import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

export type GdgSegmentedButtonProps = {
  device?: 'pc' | 'mobile'
  edge?: 'left' | 'right'
  pressed?: boolean
} & ButtonHTMLAttributes<HTMLButtonElement>

const EDGE_RADIUS: Record<'pc' | 'mobile', Record<'left' | 'right', string>> = {
  pc: {
    left: 'rounded-bl-[999px] rounded-tl-[999px]',
    right: 'rounded-br-[999px] rounded-tr-[999px]'
  },
  mobile: {
    left: 'rounded-bl-[999px] rounded-tl-[999px]',
    right: 'rounded-br-[999px] rounded-tr-[999px]'
  }
}

const STATE_CLASS = {
  pressed: 'bg-red border-red text-white',
  default: 'bg-gray-100 border-gray-100 text-white',
  disabled: 'bg-gray-400 border-gray-400 text-white/70'
}

export function GdgSegmentedButton({
  device = 'pc',
  edge = 'left',
  pressed = false,
  className,
  style,
  children,
  ...rest
}: GdgSegmentedButtonProps) {
  const isDisabled = Boolean(rest.disabled)

  return (
    <button
      type="button"
      aria-pressed={pressed}
      {...rest}
      className={cn(
        'inline-flex h-11 items-center justify-center border text-base font-medium leading-6 transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40 font-pretendard whitespace-nowrap px-4',
        EDGE_RADIUS[device][edge],
        isDisabled ? STATE_CLASS.disabled : pressed ? STATE_CLASS.pressed : STATE_CLASS.default,
        isDisabled && 'pointer-events-none cursor-not-allowed',
        className
      )}
      style={style}
    >
      {children}
    </button>
  )
}