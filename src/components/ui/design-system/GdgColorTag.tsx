'use client'

import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/utils/cn'

export type GdgTagColor = 'red' | 'blue' | 'green' | 'yellow' | 'white'
export type GdgTagFill = 'off' | 'on' | 'half'
export type GdgTagSize = 'pc' | 'mobile' | 'mini'

const COLOR_META: Record<GdgTagColor, { fill: string; outline: string; half: string }> = {
  red: {
    fill: 'bg-red border-red text-white shadow-[0px_2px_40px_rgba(0,0,0,0.35)]',
    outline: 'border-red text-red',
    half: 'bg-red-400 border-red-400 text-red'
  },
  blue: {
    fill: 'bg-blue border-blue text-white shadow-[0px_2px_40px_rgba(0,0,0,0.35)]',
    outline: 'border-blue text-blue',
    half: 'bg-blue-400 border-blue-400 text-blue'
  },
  green: {
    fill: 'bg-green border-green text-white shadow-[0px_2px_40px_rgba(0,0,0,0.35)]',
    outline: 'border-green text-green',
    half: 'bg-green-400 border-green-400 text-green'
  },
  yellow: {
    fill: 'bg-yellow border-yellow text-black shadow-[0px_2px_40px_rgba(0,0,0,0.35)]',
    outline: 'border-yellow text-yellow',
    half: 'bg-yellow-400 border-yellow-400 text-yellow'
  },
  white: {
    fill: 'bg-white border-white text-black shadow-[0px_2px_40px_rgba(0,0,0,0.35)]',
    outline: 'border-white text-white',
    half: 'bg-gray-200 border-gray-200 text-gray-700'
  }
}

const SIZE_CLASS: Record<GdgTagSize, string> = {
  pc: 'h-[25px] px-4 text-[16px] leading-[20px] gap-2',
  mobile: 'h-[25px] px-3 text-[14px] leading-[18px] gap-1.5',
  mini: 'h-[19px] px-2.5 text-[12px] leading-[16px] gap-1'
}

export interface GdgColorTagProps extends ComponentPropsWithoutRef<'span'> {
  size?: GdgTagSize
  color?: GdgTagColor
  fill?: GdgTagFill
}

export function GdgColorTag({
  size = 'pc',
  color = 'red',
  fill = 'on',
  className,
  style,
  children,
  ...rest
}: GdgColorTagProps) {
  const meta = COLOR_META[color]
  const baseClass = SIZE_CLASS[size]

  const fillClass = fill === 'on' ? meta.fill : fill === 'off' ? meta.outline : ''

  return (
    <span
      {...rest}
      className={cn(
        'inline-flex items-center justify-center rounded-full font-medium uppercase tracking-tight border transition-colors duration-150',
        baseClass,
        fillClass,
        fill === 'half' && meta.half,
        className
      )}
      style={style}
    >
      {children}
    </span>
  )
}
