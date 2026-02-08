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
    wrapper: 'border-gray-400 bg-black text-white placeholder:text-gray-800 focus:border-white/70',
    helper: 'text-gray-800'
  },
  error: {
    wrapper: 'border-red bg-black text-white placeholder:text-red/70',
    helper: 'text-red'
  },
  disabled: {
    wrapper: 'border-gray-400 bg-gray-400 text-gray-900 placeholder:text-gray-900 opacity-60 cursor-not-allowed',
    helper: 'text-gray-900'
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
      onChange,
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
    }, [adjustHeight, rest.value, rows])

    const handleChange = useCallback(
      (event: ChangeEvent<HTMLTextAreaElement>) => {
        adjustHeight()
        onChange?.(event)
      },
      [adjustHeight, onChange],
    )

    const lineHeight = 24
    const verticalPadding = 32 // py-4
    const minHeight = rows ? rows * lineHeight + verticalPadding : undefined

    return (
      <label className={cn('flex w-full flex-col gap-2', className)} htmlFor={fieldId} style={style}>
        {label && (
          <span className="text-[14px] font-semibold uppercase tracking-[0.2em] text-white/80">
            {label}
          </span>
        )}
        <textarea
          {...rest}
          id={fieldId}
          ref={mergeRefs}
          disabled={disabled}
          rows={rows}
          className={cn(
            'rounded-3xl border px-4 py-3 font-medium leading-[24px] placeholder:font-medium focus:border-white/70 focus:outline-none focus-visible:outline-none resize-none overflow-hidden',
            fullWidth ? 'w-full' : WIDTH_CLASS[device],
            TA_STATE[computedState].wrapper
          )}
          style={{ ...style, minHeight: minHeight ? `${minHeight}px` : undefined }}
          onChange={handleChange}
        />
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
