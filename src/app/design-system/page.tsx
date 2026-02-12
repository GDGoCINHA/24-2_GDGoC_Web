'use client'

import { type CSSProperties } from 'react'

import { DesignSystemShowcase } from '@/components/ui/design-system/DesignSystemShowcase'

type GridDevice = 'desktop' | 'mobile'

type GridSpec = {
  id: string
  label: string
  columns: number
}

type GridGroup = {
  id: string
  heading: string
  badge: string
  device: GridDevice
  frameWidth: number
  gridWidth: number
  gutter: number
  height: number
  specs: GridSpec[]
}

type GridCustomProperties = CSSProperties & {
  '--grid-count'?: number
  '--grid-content-width'?: string
  '--grid-frame-width'?: string
  '--grid-gutter'?: string
  '--grid-height'?: string
}

const DESKTOP_GRID_GROUPS: GridGroup[] = [
  {
    id: 'desktop-long',
    heading: '작업영역 1120px (정보값 많은 페이지에 활용)',
    badge: 'Long',
    device: 'desktop',
    frameWidth: 1280,
    gridWidth: 1120,
    gutter: 20,
    height: 440,
    specs: [
      { id: 'desktop-long-12', label: '12단', columns: 12 },
      { id: 'desktop-long-8', label: '8단', columns: 8 },
      { id: 'desktop-long-4', label: '4단', columns: 4 },
      { id: 'desktop-long-2', label: '2단', columns: 2 }
    ]
  },
  {
    id: 'desktop-short',
    heading: '작업영역 550px (정보값 적은 페이지에 활용)',
    badge: 'Short',
    device: 'desktop',
    frameWidth: 1280,
    gridWidth: 550,
    gutter: 20,
    height: 400,
    specs: [
      { id: 'desktop-short-12', label: '12단', columns: 12 },
      { id: 'desktop-short-8', label: '8단', columns: 8 },
      { id: 'desktop-short-4', label: '4단', columns: 4 },
      { id: 'desktop-short-2', label: '2단', columns: 2 }
    ]
  }
]

const MOBILE_GRID_GROUP: GridGroup = {
  id: 'mobile',
  heading: '작업영역 343px',
  badge: 'Mobile',
  device: 'mobile',
  frameWidth: 375,
  gridWidth: 343,
  gutter: 8,
  height: 320,
  specs: [
    { id: 'mobile-4', label: '4단', columns: 4 },
    { id: 'mobile-3', label: '3단', columns: 3 },
    { id: 'mobile-2', label: '2단', columns: 2 }
  ]
}

const formatColumnDetail = (columns: number, gridWidth: number, gutter: number) => {
  const totalGutter = gutter * (columns - 1)
  const width = (gridWidth - totalGutter) / columns
  const rounded = Number(width.toFixed(2))
  const formatted = Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toString()

  return `${formatted}px · Gutter ${gutter}px`
}

const GridPreview = ({
  columns,
  device,
  frameWidth,
  gridWidth,
  gutter,
  height
}: {
  columns: number
  device: GridDevice
  frameWidth: number
  gridWidth: number
  gutter: number
  height: number
}) => {
  const customStyle: GridCustomProperties = {
    '--grid-count': columns,
    '--grid-frame-width': `${frameWidth}px`,
    '--grid-content-width': `${gridWidth}px`,
    '--grid-gutter': `${gutter}px`,
    '--grid-height': `${height}px`
  }

  return (
    <div className="ds-grid-viewport" data-device={device} style={customStyle}>
      <div className="ds-grid-columns">
        {Array.from({ length: columns }).map((_, index) => (
          <span key={index} className="ds-grid-column" aria-hidden="true" />
        ))}
      </div>
    </div>
  )
}

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-black px-4 py-10 text-white">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Internal Only</p>
          <h1 className="mt-2 text-3xl font-bold">GDGoC Design System</h1>
          <p className="text-sm text-white/60">
            개발 중 확인용 임시 페이지입니다. PR 시 제거 예정.
          </p>
        </div>
        <DesignSystemShowcase />
      </div>
    </div>
  )
}
