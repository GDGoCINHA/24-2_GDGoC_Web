'use client'

import { Input, type InputProps } from '@nextui-org/react'

type GdgInputProps = InputProps
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

export function GdgInput({ classNames, radius, ...props }: GdgInputProps) {
  return (
    <Input
      {...props}
      radius={radius ?? 'full'}
      classNames={{
        ...classNames,
        label: mergeClassNames('text-gray-900 pb-2', classNames?.label),
        mainWrapper: mergeClassNames('relative', classNames?.mainWrapper),
        inputWrapper: mergeClassNames(
          [
            'h-11',
            'rounded-full',
            'px-4',
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
            '!ml-0',
            'text-white',
            'placeholder:text-gray-700',
            'placeholder:font-medium',
            'placeholder:opacity-100',
            'font-medium',
            'text-base',
            'leading-6',
            'mobile:text-sm',
            'mobile:leading-5',
            'group-data-[disabled=true]:text-gray-900',
            'group-data-[disabled=true]:placeholder:text-gray-900',
            'group-data-[focus=true]:placeholder:text-transparent'
          ].join(' '),
          classNames?.input
        ),
        helperWrapper: mergeClassNames('pl-2 pt-2', classNames?.helperWrapper),
        errorMessage: mergeClassNames(
          'text-red text-xs leading-4 font-medium',
          classNames?.errorMessage
        )
      }}
    />
  )
}
