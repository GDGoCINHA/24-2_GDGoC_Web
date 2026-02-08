'use client'

import Link from 'next/link'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

type Device = 'pc' | 'mobile'
type ButtonSize = 'large' | 'small'
type Variant = 'default' | 'active' | 'pressed' | 'disabled'

type ButtonLike = ButtonHTMLAttributes<HTMLButtonElement> & AnchorHTMLAttributes<HTMLAnchorElement>

export type GdgButtonProps = {
  as?: 'button' | 'a'
  device?: Device
  size?: ButtonSize
  variant?: Variant
  fullWidth?: boolean
  icon?: ReactNode
  loading?: boolean
} & Omit<ButtonLike, 'as'>

const SIZE_CLASS: Record<Device, Record<ButtonSize, string>> = {
  pc: {
    large: 'h-[52px] px-12 text-[16px] leading-[24px]',
    small: 'h-[52px] px-6 text-[16px] leading-[24px] min-w-[122px]'
  },
  mobile: {
    large: 'h-[48px] px-8 text-[16px] leading-[24px]',
    small: 'h-[44px] px-5 text-[14px] leading-[20px] min-w-[109px]'
  }
}

const VARIANT_CLASS: Record<Variant, string> = {
  default: 'bg-gray-100 text-white border-gray-100',
  active: 'bg-red text-white border-red shadow-[0px_2px_50px_rgba(0,0,0,0.5)]',
  pressed: 'bg-red-400 text-white border-red',
  disabled: 'bg-gray-400 text-white/70 border-gray-400'
}

export function GdgButton({
  as = 'button',
  device = 'pc',
  size = 'large',
  variant = 'default',
  fullWidth,
  icon,
  loading,
  className,
  children,
  href,
  disabled,
  ...rest
}: GdgButtonProps) {
  const isDisabled = disabled || variant === 'disabled' || loading
  const classes = cn(
    'inline-flex items-center justify-center gap-2 rounded-full border font-medium transition-all duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40',
    SIZE_CLASS[device][size],
    fullWidth ? 'w-full' : 'w-auto',
    VARIANT_CLASS[variant],
    isDisabled && 'pointer-events-none opacity-70 cursor-not-allowed',
    className
  )

  const inner = (
    <>
      {loading && (
        <span className="size-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" aria-hidden />
      )}
      {icon && <span className="shrink-0" aria-hidden>{icon}</span>}
      <span>{children}</span>
    </>
  )

  if (as === 'a') {
    return (
      <Link
        {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
        href={href ?? '#'}
        aria-disabled={isDisabled}
        className={classes}
        style={rest.style}
      >
        {inner}
      </Link>
    )
  }

  return (
    <button
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
      type={(rest as ButtonHTMLAttributes<HTMLButtonElement>).type ?? 'button'}
      disabled={isDisabled}
      className={classes}
      style={rest.style}
    >
      {inner}
    </button>
  )
}
