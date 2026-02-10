'use client'

import { type ReactNode } from 'react'
import { cn } from '@/utils/cn'

export type GdgFieldStatus = 'success' | 'error'

export interface GdgFieldContainerProps {
  label: string
  required?: boolean
  caption?: string
  status?: GdgFieldStatus
  statusMessage?: string
  children: ReactNode
  action?: ReactNode
}

export function GdgFieldContainer({
  label,
  required = false,
  caption,
  status,
  statusMessage,
  children,
  action
}: GdgFieldContainerProps) {
  const hasStatus = Boolean(status && statusMessage)

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center gap-1 pl-2">
        <p className="typo-s3 text-white">{label}</p>
        {required && <p className="typo-s3 text-red">*</p>}
      </div>
      
      <div className={cn("flex w-full items-center", action ? "gap-5 mobile:gap-2" : "")}>
        {children}
        {action}
      </div>

      {caption && !hasStatus && (
        <p className="typo-c2 pl-2 text-gray-400">{caption}</p>
      )}
      
      {hasStatus && (
        <p className={cn('typo-c2 pl-2', status === 'success' ? 'text-green' : 'text-red')}>
          {statusMessage}
        </p>
      )}
    </div>
  )
}