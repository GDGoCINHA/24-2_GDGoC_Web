'use client'

import Link from 'next/link'
import {
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactNode,
  useRef,
  useState
} from 'react'
import { cn } from '@/utils/cn'
import { getMobileWidthClass, getPcWidthClass, isWideOnlyWidth } from './controlMeta'
import type { Device, PcWidthVariant, WidthToken } from './controlMeta'

export const GDG_BUTTON_SIZES = ['large', 'small'] as const
export type ButtonSize = (typeof GDG_BUTTON_SIZES)[number]

export const GDG_BUTTON_VARIANTS = [
  'default',
  'active',
  'pressed',
  'disabled',
  'white',
  'bordered'
] as const
export type Variant = (typeof GDG_BUTTON_VARIANTS)[number]

type ButtonLike = ButtonHTMLAttributes<HTMLButtonElement> & AnchorHTMLAttributes<HTMLAnchorElement>

export type GdgButtonProps = {
  as?: 'button' | 'a'
  device?: Device
  size?: ButtonSize
  variant?: Variant
  widthToken?: WidthToken
  pcVariant?: PcWidthVariant
  fullWidth?: boolean
  icon?: ReactNode
  loading?: boolean
} & Omit<ButtonLike, 'as'>

type Ripple = {
  id: number
  x: number
  y: number
  size: number
  active: boolean
}

const SIZE_CLASS: Record<Device, Record<ButtonSize, string>> = {
  pc: {
    large: 'h-13 px-12 text-base leading-6',
    small: 'h-11 px-6 text-base leading-6 w-30.5'
  },
  mobile: {
    large: 'h-12 px-8 text-base leading-6',
    small: 'h-11 px-5 text-sm leading-5 w-27.25'
  }
}

const VARIANT_CLASS: Record<Variant, string> = {
  default: 'bg-gray-100 text-white border-gray-100',
  active: 'bg-red text-white border-red shadow-[0px_2px_50px_rgba(0,0,0,0.5)]',
  pressed: 'bg-red-400 text-white border-red',
  disabled: 'bg-gray-400 text-white/70 border-gray-400',
  white: 'bg-white text-black border-white shadow-[0px_5px_35px_rgba(18,18,18,0.05)]',
  bordered: 'bg-black text-white border-gray-800 hover:border-gray-900 transition-colors'
}

export function GdgButton({
  as = 'button',
  device = 'pc',
  size = 'large',
  variant = 'default',
  widthToken,
  pcVariant,
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
  const effectiveVariant = isDisabled ? 'disabled' : variant
  const [ripples, setRipples] = useState<Ripple[]>([])
  const rippleIdRef = useRef(0)

  const defaultPcVariant: PcWidthVariant =
    widthToken && isWideOnlyWidth(widthToken) ? 'wide' : 'narrow'
  const resolvedPcVariant = pcVariant ?? defaultPcVariant

  const widthClass = fullWidth
    ? 'w-full'
    : widthToken
      ? device === 'pc'
        ? getPcWidthClass(widthToken, resolvedPcVariant)
        : getMobileWidthClass(widthToken)
      : SIZE_CLASS[device][size].split(' ').find((c) => c.startsWith('w-')) || ''

  const classes = cn(
    'relative isolate inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border font-medium overflow-hidden transition-all duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40 font-pretendard shrink-0',
    SIZE_CLASS[device][size].replace(/w-\S+/g, ''),
    widthClass,
    VARIANT_CLASS[effectiveVariant],
    effectiveVariant === 'white' && (device === 'pc' ? 'typo-pc-s3' : 'typo-m-s2'),
    !isDisabled && 'cursor-pointer active:scale-[0.98] active:translate-y-px',
    isDisabled && 'pointer-events-none cursor-not-allowed opacity-70',
    className
  )
  const rippleColorClass = effectiveVariant === 'white' ? 'bg-black/20' : 'bg-white/35'

  const triggerRipple = (event: MouseEvent<HTMLElement>) => {
    if (isDisabled) return

    const element = event.currentTarget as HTMLElement
    const rect = element.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height) * 2
    const isKeyboardClick = event.detail === 0
    const x = isKeyboardClick ? rect.width / 2 : event.clientX - rect.left
    const y = isKeyboardClick ? rect.height / 2 : event.clientY - rect.top
    const id = rippleIdRef.current++

    setRipples((prev) => [...prev, { id, x, y, size, active: false }])

    requestAnimationFrame(() => {
      setRipples((prev) =>
        prev.map((ripple) => (ripple.id === id ? { ...ripple, active: true } : ripple))
      )
    })

    window.setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== id))
    }, 550)
  }

  const inner = (
    <>
      <span className="pointer-events-none absolute inset-0">
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className={cn('absolute rounded-full', rippleColorClass)}
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
              transform: `translate(-50%, -50%) scale(${ripple.active ? 1 : 0})`,
              opacity: ripple.active ? 0 : 0.35,
              transition: 'transform 550ms ease-out, opacity 550ms ease-out'
            }}
          />
        ))}
      </span>
      <span className="relative z-10 inline-flex items-center justify-center gap-2">
        {loading && (
          <span
            className="size-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent"
            aria-hidden
          />
        )}
        {icon && (
          <span className="shrink-0" aria-hidden>
            {icon}
          </span>
        )}
        {children}
      </span>
    </>
  )

  const commonProps = {
    className: classes,
    style: rest.style,
    'aria-disabled': isDisabled
  }

  if (as === 'a') {
    const anchorProps = rest as AnchorHTMLAttributes<HTMLAnchorElement>

    return (
      <Link
        {...anchorProps}
        href={href ?? '#'}
        onClick={(event) => {
          triggerRipple(event)
          anchorProps.onClick?.(event)
        }}
        {...commonProps}
      >
        {inner}
      </Link>
    )
  }

  const buttonProps = rest as ButtonHTMLAttributes<HTMLButtonElement>

  return (
    <button
      {...buttonProps}
      type={buttonProps.type ?? 'button'}
      disabled={isDisabled}
      onClick={(event) => {
        triggerRipple(event)
        buttonProps.onClick?.(event)
      }}
      {...commonProps}
    >
      {inner}
    </button>
  )
}
