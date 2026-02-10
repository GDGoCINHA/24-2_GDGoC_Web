'use client'

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  type ChangeEvent,
  type TextareaHTMLAttributes,
} from 'react'
import { cn } from '@/utils/cn'

export interface GdgTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  device?: 'pc' | 'mobile'
  state?: 'default' | 'error'
  label?: string
  helperText?: string
  errorText?: string
  fullWidth?: boolean
}

const WIDTH_CLASS: Record<'pc' | 'mobile', string> = {
  pc: 'w-[550px]',
  mobile: 'w-[343px]'
}

const TA_STATE: Record<'default' | 'error' | 'disabled', { wrapper: string; helper: string }> = {
  default: {
    wrapper: 'border-gray-800 bg-black text-white placeholder:text-gray-700',
    helper: 'text-gray-400'
  },
  error: {
    wrapper: 'border-red bg-black text-white placeholder:text-red/50',
    helper: 'text-red'
  },
  disabled: {
    wrapper: 'border-gray-100 bg-gray-100 text-white/40 placeholder:text-white/20 cursor-not-allowed',
    helper: 'text-white/40'
  }
}

export const GdgTextarea = forwardRef<HTMLTextAreaElement, GdgTextareaProps>(
  (
    {
      device = 'pc',
      state = 'default',
      label,
      helperText,
      errorText,
      className,
      style,
      fullWidth,
      disabled,
      id,
      rows = 4,
      maxLength,
      onChange,
      value,
      ...rest
    },
    forwardedRef
  ) => {
    const generatedId = useId()
    const fieldId = id ?? generatedId
    const computedState: 'default' | 'error' | 'disabled' = disabled ? 'disabled' : state

    const textareaRef = useRef<HTMLTextAreaElement | null>(null)
    const mergeRefs = useCallback(
      (node: HTMLTextAreaElement | null) => {
        textareaRef.current = node
        if (typeof forwardedRef === 'function') {
          forwardedRef(node)
        } else if (forwardedRef) {
          forwardedRef.current = node
        }
      },
      [forwardedRef],
    )

    const adjustHeight = useCallback(() => {
      const el = textareaRef.current
      if (!el) return
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    }, [])

    useEffect(() => {
      adjustHeight()
    }, [adjustHeight, value, rows])

    const handleChange = useCallback(
      (event: ChangeEvent<HTMLTextAreaElement>) => {
        adjustHeight()
        onChange?.(event)
      },
      [adjustHeight, onChange],
    )

    const currentLength = typeof value === 'string' ? value.length : 0

    return (
      <label className={cn('flex w-full flex-col gap-2', className)} htmlFor={fieldId} style={style}>
        {label && (
          <span className="text-[14px] font-semibold uppercase tracking-[0.2em] text-white/80">
            {label}
          </span>
        )}
        <div className={cn(
            'relative rounded-3xl border px-4 py-3 transition-colors duration-150',
            fullWidth ? 'w-full' : WIDTH_CLASS[device],
            TA_STATE[computedState].wrapper
          )}
        >
          <textarea
            {...rest}
            id={fieldId}
            ref={mergeRefs}
            disabled={disabled}
            rows={rows}
            maxLength={maxLength}
            value={value}
            className={cn(
              'w-full bg-transparent font-medium pc:text-base pc:leading-6 mobile:text-sm mobile:leading-5 placeholder:font-medium focus:outline-none resize-none overflow-hidden block',
              maxLength ? 'pb-6' : ''
            )}
            style={{ ...style, height: 'auto' }}
            onChange={handleChange}
          />
          {maxLength && (
            <div className="absolute bottom-3 right-4 text-[12px] leading-[18px] text-gray-400 font-medium">
              {currentLength}/{maxLength}
            </div>
          )}
        </div>
        {(helperText || errorText) && (
          <span className={cn('pl-2 text-[12px] leading-[18px]', TA_STATE[computedState].helper)}>
            {computedState === 'error' ? errorText ?? helperText : helperText}
          </span>
        )}
      </label>
    )
  }
)

GdgTextarea.displayName = 'GdgTextarea'
