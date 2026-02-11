export type Device = 'pc' | 'mobile'

export const GDG_PC_NARROW_WIDTHS = ['small', 'medium', 'oneThird', 'twoThirds', 'full'] as const
export const GDG_PC_WIDE_WIDTHS = ['mini', 'small', 'quarter', 'medium', 'full'] as const
export const GDG_MOBILE_WIDTHS = ['small', 'medium', 'twoThirds', 'full'] as const

export type PcWidthVariant = 'narrow' | 'wide'
export type PcNarrowWidthToken = (typeof GDG_PC_NARROW_WIDTHS)[number]
export type PcWideWidthToken = (typeof GDG_PC_WIDE_WIDTHS)[number]
export type MobileWidthToken = (typeof GDG_MOBILE_WIDTHS)[number]
export type WidthToken = PcNarrowWidthToken | PcWideWidthToken | MobileWidthToken
export type SizeToken = 'default' | 'mini'

export const PC_WIDTH_META = {
  narrow: {
    small: 'w-30.5',
    medium: 'w-66.25',
    oneThird: 'w-43.25',
    twoThirds: 'w-102',
    full: 'w-137.5'
  },
  wide: {
    mini: 'w-21.5',
    small: 'w-31.125',
    quarter: 'w-66.25',
    medium: 'w-137.5',
    full: 'w-280'
  }
} as const

export const MOBILE_WIDTH_META = {
  small: 'w-27.25',
  medium: 'w-42',
  twoThirds: 'w-56.5',
  full: 'w-85.75'
} as const

export const isWideOnlyWidth = (size: WidthToken): boolean => size === 'mini' || size === 'quarter'

export const getPcWidthClass = (size: WidthToken, variant: PcWidthVariant = 'narrow') => {
  const map = PC_WIDTH_META[variant] as Record<string, string>
  return map[size as keyof typeof map] ?? map.full
}

export const getMobileWidthClass = (size: WidthToken) => {
  const map = MOBILE_WIDTH_META as Record<string, string>
  return map[size as keyof typeof map] ?? map.full
}

export type ControlMeta = { height: string; padding: string; text: string }
export type ControlMetaMap = Partial<Record<WidthToken, ControlMeta>> & { default: ControlMeta }

export const CONTROL_META: Record<Device, ControlMetaMap> = {
  pc: {
    default: { height: 'h-11', padding: 'px-5', text: 'typo-pc-b2' },
    mini: { height: 'h-4.5', padding: 'px-3', text: 'typo-pc-c1' }
  },
  mobile: {
    default: { height: 'h-11', padding: 'px-4', text: 'typo-m-b3' }
  }
}

export const getControlMeta = (device: Device, size: WidthToken): ControlMeta =>
  CONTROL_META[device][size] ?? CONTROL_META[device].default
