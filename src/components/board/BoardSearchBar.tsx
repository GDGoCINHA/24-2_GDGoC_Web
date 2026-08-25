'use client'

import type { BoardSearchType } from '@/types/board'

export interface BoardSearchOption {
  id: string
  label: string
}

// 게시판 종류를 모르는 공용 컴포넌트다. 공지·자유도 그대로 쓴다.
export interface BoardSearchBarProps {
  searchType: BoardSearchType
  keyword: string
  searchTypeOptions: BoardSearchOption[]
  onSearchTypeChange: (type: BoardSearchType) => void
  onKeywordChange: (keyword: string) => void
  onSubmit: () => void
}

const PILL = 'rounded-full border border-[rgba(240,234,228,0.16)] bg-[rgba(240,234,228,0.06)]'

/**
 * 디자인 시스템의 `GdgDropdown`·`GdgSearchField` 를 쓰지 않는다. 그쪽은 폭이
 * device·size prop 으로 고정돼 있어 이 화면의 유동 레이아웃과 맞물리지 않았고,
 * 밝은 배경 화면들이 계속 쓰는 컨트롤이라 색만 따로 바꿀 수도 없다.
 *
 * 좁아지면 검색창이 다음 줄로 접힌다. 별도의 모바일 분기가 필요 없다.
 */
export function BoardSearchBar({
  searchType,
  keyword,
  searchTypeOptions,
  onSearchTypeChange,
  onKeywordChange,
  onSubmit
}: BoardSearchBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <label className="sr-only" htmlFor="board-search-type">
        검색 조건
      </label>
      <select
        id="board-search-type"
        value={searchType}
        onChange={(event) => onSearchTypeChange(event.target.value as BoardSearchType)}
        className={`${PILL} cursor-pointer appearance-none px-5 py-3 text-sm text-dusk-ink-200 outline-none focus:border-ember mobile:text-base`}
      >
        {searchTypeOptions.map((option) => (
          <option key={option.id} value={option.id} className="bg-dusk-field">
            {option.label}
          </option>
        ))}
      </select>

      <div className={`${PILL} flex flex-[1_1_260px] items-center gap-2.5 px-5 py-3`}>
        <input
          type="text"
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== 'Enter') return
            event.preventDefault()
            onSubmit()
          }}
          placeholder="검색어를 입력하세요"
          aria-label="검색어"
          className="min-w-0 flex-1 appearance-none border-none bg-transparent text-sm text-dusk-ink-100 outline-none placeholder:text-dusk-ink-800 mobile:text-base"
        />
        <button
          type="button"
          onClick={onSubmit}
          className="shrink-0 cursor-pointer whitespace-nowrap text-sm text-ember transition-colors hover:text-dusk-ink-100"
        >
          검색
        </button>
      </div>
    </div>
  )
}
