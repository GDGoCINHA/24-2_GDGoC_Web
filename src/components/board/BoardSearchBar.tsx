'use client'

import { GdgDropdown, GdgSearchField, type GdgDropdownOption } from '@/components/ui/design-system'
import type { EventSearchType } from '@/types/board'

export interface BoardSearchBarProps {
  searchType: EventSearchType
  keyword: string
  searchTypeOptions: GdgDropdownOption[]
  onSearchTypeChange: (type: EventSearchType) => void
  onKeywordChange: (keyword: string) => void
  onSubmit: () => void
}

export function BoardSearchBar({
  searchType,
  keyword,
  searchTypeOptions,
  onSearchTypeChange,
  onKeywordChange,
  onSubmit
}: BoardSearchBarProps) {
  return (
    <div className="flex w-full items-center gap-2">
      <GdgDropdown
        options={searchTypeOptions}
        value={searchType}
        onChange={(value) => onSearchTypeChange(value as EventSearchType)}
      />
      <GdgSearchField
        value={keyword}
        onChange={(event) => onKeywordChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            onSubmit()
          }
        }}
        placeholder="검색어를 입력하세요"
      />
    </div>
  )
}
