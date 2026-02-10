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
  const controlMeta = getControlMeta(device, size)
  const ITEM_CLASS = cn(
    'flex h-9 items-center justify-between rounded-lg px-2 text-white outline-none transition-colors',
    controlMeta.text,
    'hover:bg-white hover:text-black',
    'selected:bg-white selected:text-black selected:font-medium',
    'focus:bg-white focus:text-black',
    '[&_[data-slot=selected-icon]]:text-black'
  )
  const [internalValue, setInternalValue] = useState(defaultValue ?? '')
  const currentValue = value ?? internalValue
  const isGrouped = Boolean(optionGroups?.length)
  const hasError = Boolean(isInvalid)

  const resolvedOptions = useMemo(
    () => (optionGroups ? optionGroups.flatMap((group) => group.items) : options),
    [optionGroups, options]
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
  const isMini = device === 'pc' && size === 'mini'

  // Fixed border color to gray-800 unless it's an error.
  const baseClass = cn(
    'rounded-full bg-black border transition-colors',
    controlMeta.height,
    hasError ? 'border-red' : 'border-gray-800',
    hasError ? 'hover:border-red' : '',
    hasError ? 'focus:border-red' : '',
    'disabled:bg-gray-100 disabled:border-gray-100 disabled:cursor-not-allowed disabled:text-white/40'
  )

  const selectorClass = cn(
    'h-full w-auto min-w-0 mx-0 justify-between bg-transparent font-medium text-white hover:bg-transparent focus-visible:outline-none',
    isMini && 'px-0 py-0 [&_[data-slot=inner-wrapper]]:h-auto',
    controlMeta.text,
    'disabled:text-white/40 disabled:cursor-not-allowed'
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
        variant="bordered"
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
          base: cn('gdg-dropdown-trigger w-full', baseClass),
          selectorButton: selectorClass,
          listbox: cn(
            'w-full p-0 m-0 list-none flex flex-col items-stretch content-start justify-start',
            isGrouped ? 'gap-2.5' : 'gap-1'
          ),
          listboxWrapper:
            'bg-transparent block p-0 m-0 w-full items-stretch content-start justify-start',
          popoverContent: cn(
            'gdg-dropdown-popover bg-gray-100 border border-white/10 rounded-xl shadow-[0_20px_120px_rgba(0,0,0,0.75)] p-3 h-auto overflow-auto justify-start',
            POPOVER_MAX_HEIGHT_CLASS[device]
          ),
          endContentWrapper: cn(
            'ml-auto flex items-center justify-end text-gray-900 bg-transparent border-0 shadow-none rounded-none !p-0 !px-0 !py-0 !m-0 mx-0',
            isMini && 'h-auto self-center'
          ),
          clearButton: 'hidden'
        }}
        inputProps={{
          autoFocus,
          classNames: {
            inputWrapper: cn(
              'w-full items-center bg-transparent border-none shadow-none h-full min-h-0',
              controlMeta.padding
            ),
            innerWrapper: 'w-full items-center bg-transparent border-none shadow-none h-full',
            input: [
              'w-full',
              '!ml-0',
              'h-full',
              'py-0',
              'leading-normal',
              controlMeta.text,
              'text-white',
              'placeholder:text-gray-700',
              'placeholder:font-medium',
              'placeholder:opacity-100',
              'font-medium',
              'disabled:text-white/40',
              'disabled:placeholder:text-white/20',
              'focus:placeholder:text-transparent'
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
        <p className={cn('typo-c1 pl-2', hasError ? 'text-red' : 'text-gray-400')}>{caption}</p>
      )}
    </div>
  )
}
