'use client'

import { forwardRef, type InputHTMLAttributes, type ReactNode, useId } from 'react'
import { cn } from './cn'
import type { Device, PcWidthVariant, SizeToken, WidthToken } from './controlMeta'
import { CONTROL_META, getMobileWidthClass, getPcWidthClass, isWideOnlyWidth } from './controlMeta'

type InputState = 'available' | 'disabled' | 'error'

const STATE_CLASS: Record<
  InputState,
  {
    wrapper: string
    input: string
    adornment: string
    helper: string
  }
> = {
  available: {
    wrapper: 'border-gray-800 bg-black text-white',
    input: 'text-white placeholder:text-gray-700',
    adornment: 'text-white',
    helper: 'typo-c1 pl-2 text-gray-600'
  },
  error: {
    wrapper: 'border-red bg-black text-white',
    input: 'text-white placeholder:text-red/50',
    adornment: 'text-red',
    helper: 'typo-c1 pl-2 text-red'
  },
  disabled: {
    wrapper: 'border-gray-400 bg-gray-400 text-gray-700 opacity-70 cursor-not-allowed',
    input: 'text-gray-900 placeholder:text-gray-900 cursor-not-allowed',
    adornment: 'text-gray-900',
    helper: 'typo-c1 pl-2 text-gray-900'
  }
}

export interface GdgInputFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  device?: Device
  width?: WidthToken
  density?: SizeToken
  pcVariant?: PcWidthVariant
  state?: InputState
  label?: string
  helperText?: string
  errorText?: string
  startAdornment?: ReactNode
  endAdornment?: ReactNode
  fullWidth?: boolean
}

export const GdgInputField = forwardRef<HTMLInputElement, GdgInputFieldProps>(
  (
    {
      device = 'pc',
      width = 'full',
      density,
      pcVariant,
      state,
      label,
      helperText,
      errorText,
      startAdornment,
      endAdornment,
      className,
      style,
      fullWidth,
      disabled,
      id,
      ...rest
    },
    ref
  ) => {
    const generatedId = useId()
    const fieldId = id ?? generatedId
    const hasValue =
      (typeof rest.value === 'string' && rest.value.length > 0) || typeof rest.value === 'number'
    const computedState: InputState = disabled ? 'disabled' : (state ?? 'available')
    const effectiveDensity: SizeToken = density ?? (width === 'mini' ? 'mini' : 'default')
    const defaultPcVariant: PcWidthVariant = isWideOnlyWidth(width) ? 'wide' : 'narrow'
    const resolvedPcVariant = pcVariant ?? defaultPcVariant
    const widthClass = fullWidth
      ? 'w-full'
      : device === 'pc'
        ? getPcWidthClass(width, resolvedPcVariant)
        : getMobileWidthClass(width)
    const controlMeta =
      effectiveDensity === 'mini'
        ? (CONTROL_META[device].mini ?? CONTROL_META[device].default)
        : CONTROL_META[device].default

    return (
      <label
        className={cn('flex w-full flex-col items-start gap-2', className)}
        htmlFor={fieldId}
        style={style}
      >
        {label && <span className="typo-s3 uppercase tracking-[0.2em] text-white/80">{label}</span>}
        <div
          className={cn(
            'flex items-center gap-2 rounded-[24px] border transition-colors duration-150 focus-within:border-white',
            computedState === 'available' && hasValue && 'border-white',
            controlMeta.height,
            controlMeta.padding,
            widthClass,
            STATE_CLASS[computedState].wrapper
          )}
        >
          {startAdornment && (
            <span className={cn('shrink-0', STATE_CLASS[computedState].adornment)} aria-hidden>
              {startAdornment}
            </span>
          )}
          <input
            {...rest}
            id={fieldId}
            ref={ref}
            disabled={disabled}
            onFocus={rest.onFocus}
            onBlur={rest.onBlur}
            className={cn(
              '!ml-0 flex-1 bg-transparent placeholder:font-medium focus:outline-none',
              controlMeta.text,
              STATE_CLASS[computedState].input
            )}
          />
          {endAdornment && (
            <span className={cn('shrink-0', STATE_CLASS[computedState].adornment)} aria-hidden>
              {endAdornment}
            </span>
          )}
        </div>
        {(helperText || errorText) && (
          <span className={STATE_CLASS[computedState].helper}>
            {computedState === 'error' ? (errorText ?? helperText) : helperText}
          </span>
        )}
      </label>
    )
  }
)

GdgInputField.displayName = 'GdgInputField'
