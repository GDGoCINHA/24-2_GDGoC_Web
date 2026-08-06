'use client'

import { GdgDropdown, GdgSearchField, type GdgDropdownOption } from '@/components/ui/design-system'
import type { BoardSearchType } from '@/types/board'

// 게시판 종류를 모르는 공용 컴포넌트다. 공지·자유도 그대로 쓴다.
export interface BoardSearchBarProps {
  searchType: BoardSearchType
  keyword: string
  searchTypeOptions: GdgDropdownOption[]
  onSearchTypeChange: (type: BoardSearchType) => void
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
        onChange={(value) => onSearchTypeChange(value as BoardSearchType)}
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
