'use client'

import { forwardRef, useId, type InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'
import { Search } from 'lucide-react'

export interface GdgSearchFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  device?: 'pc' | 'mobile'
  width?: 'full' | 'half'
  label?: string
}

export const GdgSearchField = forwardRef<HTMLInputElement, GdgSearchFieldProps>(
  ({ device = 'pc', width = 'full', label, className, id, style, ...rest }, ref) => {
    const generatedId = useId()
    const fieldId = id ?? generatedId

    const isPcFull = device === 'pc' && width === 'full'

    return (
      <div
        className={cn('flex flex-col gap-2', isPcFull ? 'w-full' : 'w-fit', className)}
        style={style}
      >
        {label && (
          <span className="text-[14px] font-semibold uppercase tracking-[0.2em] text-white/80">
            {label}
          </span>
        )}
        <label
          htmlFor={fieldId}
          className={cn(
            'flex items-center rounded-full border transition-colors duration-150 focus-within:border-white overflow-hidden',
            !rest.disabled ? 'border-gray-800 bg-black' : 'border-gray-400 bg-gray-400',
            isPcFull ? 'h-[42px] w-[1120px] gap-4 px-4' : 'h-[44px] gap-3 px-4',
            device === 'pc' && width === 'half' && 'w-full max-w-[412px]',
            device === 'mobile' && width === 'full' && 'w-full max-w-[343px]',
            device === 'mobile' && width === 'half' && 'w-full max-w-[226px]',
            rest.disabled && 'text-gray-900 cursor-not-allowed'
          )}
        >
          {isPcFull && <Search className="size-5 shrink-0 text-white" />}
          <input
            {...rest}
            type={rest.type ?? 'search'}
            id={fieldId}
            ref={ref}
            className={cn(
              'h-full min-w-0 flex-1 bg-transparent focus:outline-none text-white !m-0 py-0 leading-normal',
              isPcFull ? 'typo-b2 placeholder:text-gray-700' : 'typo-b3 placeholder:text-gray-600',
              rest.disabled && 'text-gray-900 placeholder:text-gray-900 cursor-not-allowed'
            )}
          />
          {!isPcFull && <Search className="size-5 shrink-0 text-white" />}
        </label>
      </div>
    )
  }
)

GdgSearchField.displayName = 'GdgSearchField'
