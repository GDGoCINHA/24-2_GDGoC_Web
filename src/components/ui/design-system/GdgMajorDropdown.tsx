'use client'

import { majorOptions, normalizeMajorCode } from '@/constant/majorOptions'
import { GdgDropdown, type GdgDropdownOptionGroup } from './GdgDropdown'

export type GdgMajorDropdownProps = {
  value: string
  onChangeAction: (value: string) => void
  autoFocus?: boolean
  isInvalid?: boolean
  errorMessage?: string
  device?: 'pc' | 'mobile' | 'auto'
}

export function GdgMajorDropdown({
  value,
  onChangeAction,
  autoFocus,
  isInvalid,
  errorMessage,
  device = 'auto'
}: GdgMajorDropdownProps) {
  const groupedOptions: GdgDropdownOptionGroup[] = majorOptions.map((group) => ({
    title: group.title,
    items: group.items.map((item) => ({
      id: item.code,
      label: item.label
    }))
  }))

  return (
    <GdgDropdown
      device={device as any}
      size="full"
      placeholder="학과를 입력해 주세요."
      optionGroups={groupedOptions}
      value={normalizeMajorCode(value)}
      onChange={onChangeAction}
      autoFocus={autoFocus}
      isInvalid={isInvalid ?? Boolean(errorMessage)}
      errorMessage={errorMessage}
    />
  )
}
