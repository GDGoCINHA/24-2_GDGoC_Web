'use client'

import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

export type GdgFieldStatus = 'success' | 'error'

export interface GdgFieldContainerProps {
  label: string
  required?: boolean
  caption?: string
  status?: GdgFieldStatus
  statusMessage?: string
  children: ReactNode
}

export function GdgFieldContainer({
  label,
  required = false,
  caption,
  status,
  statusMessage,
  children
}: GdgFieldContainerProps) {
  const hasStatus = Boolean(status && statusMessage)

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1 pl-2">
        <p className="typo-s3 text-white">{label}</p>
        {required ? <p className="typo-s3 text-red">*</p> : null}
      </div>
      {children}
      {caption ? <p className="typo-c2 pl-2 text-gray-600">{caption}</p> : null}
      {hasStatus ? (
        <p className={cn('typo-c2 pl-2', status === 'success' ? 'text-green' : 'text-red')}>
          {statusMessage}
        </p>
      ) : null}
    </div>
  )
}
