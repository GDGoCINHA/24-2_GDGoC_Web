'use client'

import {
  type GdgMajorDropdownProps,
  GdgMajorDropdown,
} from '@/components/ui/design-system/GdgMajorDropdown'

export type MajorAutocompleteProps = GdgMajorDropdownProps

export function MajorAutocomplete(props: MajorAutocompleteProps) {
  return <GdgMajorDropdown {...props} />
}
