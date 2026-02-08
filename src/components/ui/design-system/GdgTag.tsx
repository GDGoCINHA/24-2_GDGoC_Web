'use client'

import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from './cn'

export type GdgTagVariant = 'default' | 'active' | 'interactive' | 'disabled'
export type GdgTagDevice = 'pc' | 'mobile'

export type GdgTagProps = {
  device?: GdgTagDevice
  variant?: GdgTagVariant
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
} & HTMLAttributes<HTMLSpanElement>

const DEVICE_SIZE: Record<GdgTagDevice, string> = {
  pc: 'h-[32px] px-4 text-[16px] leading-[24px] gap-2',
  mobile: 'h-[30px] px-3 text-[14px] leading-[20px] gap-1.5'
}

const VARIANT_CLASS: Record<GdgTagVariant, string> = {
  default: 'border-gray-400 text-white/80',
  active: 'bg-red border-red text-white shadow-[0px_2px_50px_rgba(0,0,0,0.35)]',
  interactive: 'border-white/40 text-white hover:border-red hover:text-red',
  disabled: 'border-gray-500 text-white/40 cursor-not-allowed'
}

export function GdgTag({
  device = 'pc',
  variant = 'default',
  leadingIcon,
  trailingIcon,
  className,
  style,
  children,
  ...rest
}: GdgTagProps) {
  return (
    <span
      {...rest}
      className={cn(
        'inline-flex items-center rounded-full border font-medium uppercase tracking-tight transition-colors duration-150',
        DEVICE_SIZE[device],
        VARIANT_CLASS[variant],
        className
      )}
      style={style}
    >
      {leadingIcon && <span className="shrink-0" aria-hidden>{leadingIcon}</span>}
      <span>{children}</span>
      {trailingIcon && <span className="shrink-0" aria-hidden>{trailingIcon}</span>}
    </span>
  )
}
