import clsx from 'clsx'
import type { CSSProperties } from 'react'

type TagColor = 'red' | 'blue' | 'yellow' | 'green' | 'white'
type TagVariant = 'fill' | 'outline' | 'glass'
type TagSize = 'default' | 'mini'

type TagProps = {
  label: string
  color?: TagColor
  variant?: TagVariant
  type?: TagVariant // alias for variant
  size?: TagSize
  className?: string
}

const COLOR_MAP: Record<TagColor, string> = {
  red: 'var(--color-cred)',
  blue: 'var(--color-cblue)',
  yellow: 'var(--color-cyellow)',
  green: 'var(--color-cgreen)',
  white: 'var(--color-cwhite)'
}

const GLASS_COLOR_MAP: Record<TagColor, string> = {
  red: 'var(--color-red-glass)',
  blue: 'var(--color-blue-glass)',
  yellow: 'var(--color-yellow-glass)',
  green: 'var(--color-green-glass)',
  white: 'var(--color-white-glass)'
}

const SIZE_MAP: Record<
  TagSize,
  { padding: string; minWidth: number; height: number; fontSize: number; lineHeight: string }
> = {
  default: {
    padding: '4px 14px',
    minWidth: 52,
    height: 32,
    fontSize: 16,
    lineHeight: '16px'
  },
  mini: {
    padding: '2px 10px',
    minWidth: 41,
    height: 22,
    fontSize: 11,
    lineHeight: '14px'
  }
}

export default function Tag({
  label,
  color = 'blue',
  variant = 'fill',
  type,
  size = 'default',
  className
}: TagProps) {
  const resolvedVariant = type ?? variant
  const palette = COLOR_MAP[color]
  const glassPalette = GLASS_COLOR_MAP[color]
  const isFill = resolvedVariant === 'fill'
  const isGlass = resolvedVariant === 'glass'

  const { padding, minWidth, height, fontSize, lineHeight } = SIZE_MAP[size]

  const backgroundColor = isGlass ? glassPalette : isFill ? palette : 'transparent'
  const borderColor = isGlass ? glassPalette : palette
  const textColor = isFill
    ? color === 'white'
      ? 'var(--color-black)'
      : 'var(--color-cwhite)'
    : isGlass && color === 'white'
      ? 'var(--color-gray-700)'
      : palette

  const style: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding,
    minWidth,
    height,
    borderRadius: 9999,
    borderWidth: 1.5,
    borderStyle: 'solid',
    borderColor,
    backgroundColor,
    color: textColor,
    fontWeight: 600,
    fontSize,
    lineHeight
  }

  return (
    <span className={clsx(className)} style={style}>
      {label}
    </span>
  )
}
