'use client'

import { forwardRef, useId, type InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

export interface GdgSearchFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  device?: 'pc' | 'mobile'
  width?: 'full' | 'quarter'
  label?: string
}

const WIDTH_CLASS: Record<'pc' | 'mobile', Record<'full' | 'quarter', string>> = {
  pc: {
    full: 'w-[1120px]',
    quarter: 'w-[265px]'
  },
  mobile: {
    full: 'w-full',
    quarter: 'w-[180px]'
  }
}

export const GdgSearchField = forwardRef<HTMLInputElement, GdgSearchFieldProps>(
  ({ device = 'pc', width = 'full', label, className, id, style, ...rest }, ref) => {
    const generatedId = useId()
    const fieldId = id ?? generatedId
    return (
      <label className={cn('flex w-full flex-col gap-2', className)} htmlFor={fieldId} style={style}>
        {label && (
          <span className="text-[14px] font-semibold uppercase tracking-[0.2em] text-white/80">
            {label}
          </span>
        )}
        <div
          className={cn(
            'flex items-center gap-3 rounded-full border px-5 text-white transition-colors duration-150 focus-within:border-white/70',
            WIDTH_CLASS[device][width],
            'bg-black border-gray-400',
            rest.disabled && 'bg-gray-400 border-gray-400 text-gray-900'
          )}
        >
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="size-5 text-gray-800"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15.5 15.5 20 20"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" />
          </svg>
          <input
            {...rest}
            type={rest.type ?? 'search'}
            id={fieldId}
            ref={ref}
            className={cn(
              '!ml-0 h-[40px] flex-1 bg-transparent text-[16px] font-medium placeholder:font-medium placeholder:text-gray-800 focus:outline-none text-white',
              rest.disabled && 'text-gray-900 placeholder:text-gray-900 cursor-not-allowed'
            )}
          />
        </div>
      </label>
    )
  }
)

GdgSearchField.displayName = 'GdgSearchField'
