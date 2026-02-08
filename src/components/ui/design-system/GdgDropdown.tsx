'use client'

import { Autocomplete, AutocompleteItem, AutocompleteSection } from '@nextui-org/react'
import { type Key, useCallback, useEffect, useMemo, useState } from 'react'
import { cn } from '@/utils/cn'
import styles from './GdgDropdown.module.css'
import {
  CONTROL_META,
  getControlMeta,
  getMobileWidthClass,
  getPcWidthClass,
  isWideOnlyWidth
} from './controlMeta'
import type { Device, PcWidthVariant, WidthToken } from './controlMeta'

export type GdgDropdownOption = {
  id: string
  label: string
}

export type GdgDropdownOptionGroup = {
  title: string
  items: GdgDropdownOption[]
}

export type GdgDropdownSize = Exclude<WidthToken, 'quarter'>

export interface GdgDropdownProps {
  device?: Device
  size?: GdgDropdownSize
  pcVariant?: PcWidthVariant
  label?: string
  placeholder?: string
  helperText?: string
  options?: GdgDropdownOption[]
  optionGroups?: GdgDropdownOptionGroup[]
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  disabled?: boolean
  autoFocus?: boolean
  isInvalid?: boolean
  errorMessage?: string
}

const POPOVER_MAX_HEIGHT_CLASS: Record<Device, string> = {
  pc: 'max-h-75',
  mobile: 'max-h-66.5'
}

export function GdgDropdown({
  device = 'pc',
  size = 'small',
  pcVariant,
  label,
  placeholder = '선택하세요',
  helperText,
  options = [],
  optionGroups,
  value,
  defaultValue,
  onChange,
  disabled,
  autoFocus,
  isInvalid,
  errorMessage
}: GdgDropdownProps) {
  const ITEM_CLASS =
    'text-white text-base font-medium leading-6 h-9 px-2 rounded-lg flex items-center justify-between ' +
    'data-[hover=true]:bg-white data-[hover=true]:text-black ' +
    'data-[selected=true]:bg-white data-[selected=true]:text-black data-[selected=true]:font-medium ' +
    '[&[data-selected=true][data-hover=true]]:bg-white [&[data-selected=true][data-hover=true]]:text-black ' +
    '[&_[data-slot=selected-icon]]:text-black'
  const [internalValue, setInternalValue] = useState(defaultValue ?? '')
  const currentValue = value ?? internalValue
  const hasValue = Boolean(currentValue)
  const isGrouped = Boolean(optionGroups?.length)
  const hasError = Boolean(isInvalid)

  const resolvedOptions = useMemo(
    () => (optionGroups ? optionGroups.flatMap((group) => group.items) : options),
    [optionGroups, options]
  )

  const optionMap = useMemo(
    () =>
      resolvedOptions.reduce<Record<string, GdgDropdownOption>>((acc, option) => {
        acc[option.id] = option
        return acc
      }, {}),
    [resolvedOptions]
  )

  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value)
    }
  }, [value])

  const filterFn = useCallback((textValue: string, inputValue: string) => {
    const needle = inputValue.trim().toLowerCase()
    if (!needle) return true
    return textValue.toLowerCase().includes(needle)
  }, [])

  const defaultPcVariant: PcWidthVariant = isWideOnlyWidth(size) ? 'wide' : 'narrow'
  const resolvedPcVariant = pcVariant ?? defaultPcVariant
  const widthClass =
    device === 'pc' ? getPcWidthClass(size, resolvedPcVariant) : getMobileWidthClass(size)
  const controlMeta = getControlMeta(device, size)
  const isMini = device === 'pc' && size === 'mini'

  const baseClass = cn(
    'rounded-full bg-black border transition-colors',
    controlMeta.height,
    hasError ? 'border-red' : hasValue ? 'border-white' : 'border-gray-800',
    hasError ? 'group-data-[hover=true]:border-red' : 'group-data-[hover=true]:border-gray-900',
    hasError ? 'group-data-[focus=true]:border-red' : 'group-data-[focus=true]:border-white',
    'group-data-[disabled=true]:bg-gray-400 group-data-[disabled=true]:border-gray-400 group-data-[disabled=true]:opacity-60 group-data-[disabled=true]:cursor-not-allowed'
  )

  const selectorClass = cn(
    'h-full w-auto !min-w-0 justify-between bg-transparent !bg-transparent font-medium text-gray-900 hover:bg-transparent data-[hover=true]:!bg-transparent focus-visible:outline-none',
    isMini && 'min-h-0 py-0 [&_[data-slot=inner-wrapper]]:h-auto [&_[data-slot=inner-wrapper]]:min-h-0',
    isMini ? 'pl-3 pr-0' : 'pl-4 pr-0',
    controlMeta.text,
    'group-data-[disabled=true]:text-gray-900 group-data-[disabled=true]:cursor-not-allowed'
  )

  const caption = hasError ? (errorMessage ?? helperText) : helperText

  const handleSelectionChange = useCallback(
    (next: Key | null) => {
      if (next == null) return

      const nextValue = next ? String(next) : ''
      if (value === undefined) {
        setInternalValue(nextValue)
      }
      onChange?.(nextValue)
    },
    [onChange, value]
  )

  return (
    <div className={cn('flex flex-col items-start gap-2 text-white', styles.root)}>
      {label && (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">{label}</p>
      )}
      <Autocomplete
        aria-label={label ?? 'dropdown'}
        placeholder={placeholder}
        selectedKey={currentValue}
        onSelectionChange={handleSelectionChange}
        isDisabled={disabled}
        isInvalid={hasError}
        allowsEmptyCollection
        menuTrigger="focus"
        isVirtualized={false}
        defaultFilter={filterFn}
        listboxProps={{
          classNames: {
            base: 'w-full relative flex flex-col gap-0 p-0 overflow-visible',
            list: cn(
              'w-full p-0 m-0 list-none flex flex-col items-stretch content-start justify-start outline-none',
              isGrouped ? 'gap-2.5' : 'gap-1'
            )
          }
        }}
        className={cn('w-full', widthClass)}
        classNames={{
          base: cn('gdg-dropdown-trigger', baseClass),
          selectorButton: selectorClass,
          listbox: cn(
            'w-full p-0 m-0 list-none flex flex-col items-stretch content-start justify-start',
            isGrouped ? 'gap-2.5' : 'gap-1'
          ),
          listboxWrapper:
            'bg-transparent block p-0 m-0 w-full items-stretch content-start justify-start',
          popoverContent: cn(
            'gdg-dropdown-popover bg-gray-100 border border-white/10 rounded-xl shadow-[0_20px_120px_rgba(0,0,0,0.75)] p-4 h-auto overflow-auto justify-start',
            POPOVER_MAX_HEIGHT_CLASS[device]
          ),
          endContentWrapper: cn(
            'ml-auto flex items-center justify-end text-gray-900 bg-transparent border-0 shadow-none rounded-none !p-0 !px-0 !py-0 !m-0',
            isMini && 'h-auto min-h-0 self-center'
          ),
          clearButton: 'hidden'
        }}
        inputProps={{
          autoFocus,
          classNames: {
            inputWrapper: cn(
              'px-4',
              isMini && 'h-auto min-h-0 py-0'
            ),
            innerWrapper: cn(
              isMini && 'h-auto min-h-0 items-center'
            ),
            input: [
              '!ml-0',
              controlMeta.text,
              'text-gray-900',
              'placeholder:text-gray-700',
              'placeholder:font-medium',
              'placeholder:opacity-100',
              'font-medium',
              'group-data-[disabled=true]:text-gray-900',
              'group-data-[disabled=true]:placeholder:text-gray-900',
              'group-data-[focus=true]:placeholder:text-transparent'
            ].join(' ')
          }
        }}
      >
        {isGrouped
          ? optionGroups?.map((group) => (
              <AutocompleteSection
                key={group.title}
                title={group.title}
                showDivider={false}
                classNames={{
                  base: 'relative mb-0 flex flex-col gap-2',
                  heading: 'text-gray-800 text-xs font-medium leading-5 p-0 m-0',
                  group: 'flex flex-col gap-1 p-0 m-0 data-[has-title=true]:pt-0',
                  divider: 'mt-0'
                }}
              >
                {group.items.map((item) => (
                  <AutocompleteItem key={item.id} textValue={item.label} className={ITEM_CLASS}>
                    {item.label}
                  </AutocompleteItem>
                ))}
              </AutocompleteSection>
            ))
          : resolvedOptions.map((option) => (
              <AutocompleteItem key={option.id} textValue={option.label} className={ITEM_CLASS}>
                {option.label}
              </AutocompleteItem>
            ))}
      </Autocomplete>
      {caption && (
        <p className={cn('typo-c1 pl-2', hasError ? 'text-red' : 'text-gray-600')}>{caption}</p>
      )}
    </div>
  )
}
