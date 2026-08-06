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
  /**
   * device 는 CSS 가 아니라 prop 으로 갈린다. 기본값 'pc' 를 그대로 두면
   * GdgSearchField 가 w-280(=1120px) 고정폭이라 좁은 화면을 그대로 넘어간다.
   * 리포 관례대로 pc/mobile 을 각각 렌더하고 CSS 로 감춘다 (login/page.tsx 참고).
   * 값과 핸들러가 같으니 두 벌이 떠 있어도 상태는 하나다.
   */
  const controls = (device: 'pc' | 'mobile') => (
    <>
      <GdgDropdown
        device={device}
        options={searchTypeOptions}
        value={searchType}
        onChange={(value) => onSearchTypeChange(value as BoardSearchType)}
      />
      <GdgSearchField
        device={device}
        /**
         * 모바일 full 은 w-85.75(343px)로 고정이라 드롭다운(109px)과 한 줄에 못 넣는다.
         * twoThirds(226px) + 드롭다운 + 간격 = 343px 로, mobile:px-4 컨테이너의
         * 가용 폭(375px 화면 기준 343px) 안에 정확히 들어간다.
         */
        width={device === 'pc' ? 'full' : 'twoThirds'}
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
    </>
  )

  return (
    <>
      <div className="hidden w-full items-center gap-2 pc:flex">{controls('pc')}</div>
      <div className="flex w-full min-w-0 items-center gap-2 pc:hidden">{controls('mobile')}</div>
    </>
  )
}
