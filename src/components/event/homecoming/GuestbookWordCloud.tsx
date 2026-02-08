'use client'

import { useMemo } from 'react'

const mapToRange = (value, min, max) => min + value * (max - min)

const defaultColors = {
  highlight: 'text-blue',
  muted: 'text-slate-600',
  shadow: 'drop-shadow-[0_1.5px_10px_rgba(15,23,42,0.12)]'
}

export default function GuestbookWordCloud({
  entries,
  isLoading,
  recentCount = 5,
  className = '',
  style = {},
  colorScheme = defaultColors
}) {
  const words = useMemo(() => {
    if (!entries?.length) {
      return []
    }

    return entries.map((entry, idx) => {
      const key = entry.id ?? `${entry.wristbandSerial ?? 'unknown'}-${idx}`
      const goldenRatio = 0.61803398875
      const base = Math.random() + idx * goldenRatio
      const top = mapToRange(base % 1, 12, 88)
      const left = mapToRange((base * goldenRatio) % 1, 10, 90)
      const fontSize = mapToRange(Math.random(), 1.2, 3.2)
      const rotate = mapToRange(Math.random(), -10, 10)
      const opacity = mapToRange(Math.random(), 0.45, 0.95)

      return {
        key,
        label: entry.name,
        isRecent: idx >= Math.max(entries.length - recentCount, 0),
        style: {
          top: `${top}%`,
          left: `${left}%`,
          fontSize: `${fontSize}rem`,
          opacity,
          transform: `translate(-50%, -50%) rotate(${rotate}deg)`
        }
      }
    })
  }, [entries, recentCount])

  return (
    <div className={`absolute inset-0 pointer-events-none select-none ${className}`} style={style}>
      {words.length
        ? words.map((word) => (
            <span
              key={word.key}
              style={word.style}
              className={`absolute font-semibold tracking-wide ${colorScheme.shadow} transition-all duration-700 ease-in-out ${word.isRecent ? colorScheme.highlight : colorScheme.muted}`}
            >
              {word.label}
            </span>
          ))
        : !isLoading && (
            <div className="w-full h-full flex items-center justify-center text-slate-500 text-xl">
              아직 등록된 입장 정보가 없습니다.
            </div>
          )}
    </div>
  )
}
