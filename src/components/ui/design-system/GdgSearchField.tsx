'use client'

import { forwardRef, useId, type InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'
import { Search } from 'lucide-react'
import {
  CONTROL_META,
  getMobileWidthClass,
  getPcWidthClass,
  getPlaceholderTypoByText
} from './controlMeta'

export const GDG_SEARCH_FIELD_DEVICES = ['pc', 'mobile'] as const
export const GDG_SEARCH_FIELD_WIDTHS = ['full', 'half', 'twoThirds'] as const

export interface GdgSearchFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  device?: (typeof GDG_SEARCH_FIELD_DEVICES)[number]
  width?: (typeof GDG_SEARCH_FIELD_WIDTHS)[number]
  label?: string
}

export const GdgSearchField = forwardRef<HTMLInputElement, GdgSearchFieldProps>(
  ({ device = 'pc', width = 'full', label, className, id, style, ...rest }, ref) => {
    const generatedId = useId()
    const fieldId = id ?? generatedId

    const isPc = device === 'pc'

    // Determine specific width class based on device and design spec
    const widthClass = isPc
      ? width === 'full' ? 'w-280' : width === 'half' ? 'w-103' : 'w-fit'
      : width === 'full' ? 'w-85.75' : width === 'twoThirds' ? 'w-56.5' : 'w-fit'
    
    const controlMeta = CONTROL_META[device].default

    return (
      <div
        className={cn('flex flex-col gap-2', width === 'full' ? 'w-full' : 'w-fit', className)}
        style={style}
      >
        {label && (
          <span className="typo-pc-s3 mobile:typo-m-s2 uppercase tracking-[0.2em] text-white/80">
            {label}
          </span>
        )}
        <label
          htmlFor={fieldId}
          className={cn(
            'flex items-center rounded-full border transition-colors duration-150 overflow-hidden gap-3 px-4',
            controlMeta.height,
            widthClass,
            !rest.disabled ? 'border-gray-800 bg-black' : 'border-gray-100 bg-gray-100',
            rest.disabled && 'text-white/40 cursor-not-allowed'
          )}
        >
          {(isPc && width === 'full') && <Search className="size-5 shrink-0 text-white" />}
          
          <input
            {...rest}
            type={rest.type ?? 'search'}
            id={fieldId}
            ref={ref}
            className={cn(
              'h-full min-w-0 flex-1 bg-transparent focus:outline-none text-white !m-0 py-0 leading-normal',
              controlMeta.text,
              getPlaceholderTypoByText(controlMeta.text),
              'placeholder:text-gray-700',
              rest.disabled && 'text-white/40 placeholder:text-gray-700 cursor-not-allowed'
            )}
          />

          {!(isPc && width === 'full') && <Search className="size-5 shrink-0 text-white" />}
        </label>
      </div>
    )
  }
)

GdgSearchField.displayName = 'GdgSearchField'
