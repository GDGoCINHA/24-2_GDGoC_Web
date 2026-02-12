'use client'

import { Textarea, type TextAreaProps } from '@nextui-org/react'

type GdgTextareaProps = TextAreaProps
type ClassNameValue = string | number | undefined | null | false | ClassNameValue[]

const toClassNames = (value: ClassNameValue): string[] => {
  if (!value) return []
  if (Array.isArray(value)) {
    return value.flatMap((entry) => toClassNames(entry))
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return [String(value)]
  }
  return []
}

const mergeClassNames = (base: string, extra?: ClassNameValue) =>
  [...toClassNames(base), ...toClassNames(extra)].filter(Boolean).join(' ')

export function GdgTextarea({ classNames, radius, ...props }: GdgTextareaProps) {
  return (
    <Textarea
      {...props}
      radius={radius ?? 'lg'}
      classNames={{
        ...classNames,
        inputWrapper: mergeClassNames(
          [
            'bg-black',
            'border',
            'border-gray-800',
            'transition-colors',
            'group-data-[hover=true]:border-gray-900',
            'group-data-[focus=true]:border-white',
            'group-data-[has-value=true]:border-white',
            'group-data-[invalid=true]:border-red',
            'group-data-[disabled=true]:bg-gray-400',
            'group-data-[disabled=true]:border-gray-400',
            'group-data-[disabled=true]:opacity-60'
          ].join(' '),
          classNames?.inputWrapper
        ),
        input: mergeClassNames(
          [
            'text-white',
            'placeholder:text-gray-700',
            'placeholder:font-medium',
            'placeholder:opacity-100',
            'font-medium',
            'text-[16px]',
            'leading-[24px]',
            'mobile:text-[14px]',
            'mobile:leading-[20px]',
            'group-data-[disabled=true]:text-gray-900',
            'group-data-[disabled=true]:placeholder:text-gray-700',
            'group-data-[focus=true]:placeholder:text-transparent'
          ].join(' '),
          classNames?.input
        )
      }}
    />
  )
}
