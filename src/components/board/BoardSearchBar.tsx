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
   * 디자인 시스템 컨트롤의 크기는 CSS 가 아니라 device·size prop 으로 정해진다.
   * 기본값(device='pc', size='small')을 그대로 두면
   *   - 검색 필드가 w-280(1120px) 고정이라 컨테이너 가용폭 1072px 를 넘고
   *   - 드롭다운이 w-30.5(122px) 라 '제목+내용' 이 잘린다.
   * 그래서 device 와 size 를 명시하고, pc/mobile 을 각각 렌더해 CSS 로 감춘다
   * (login/page.tsx 의 기존 관례). 값과 핸들러가 같아 두 벌이 떠 있어도 상태는 하나다.
   */
  const controls = (device: 'pc' | 'mobile') => (
    <>
      <GdgDropdown
        device={device}
        // small(pc 122px / mobile 109px)은 '제목+내용'을 담지 못한다.
        size="medium"
        options={searchTypeOptions}
        value={searchType}
        onChange={(value) => onSearchTypeChange(value as BoardSearchType)}
      />
      <GdgSearchField
        device={device}
        /**
         * pc: half(412px) + 드롭다운(265px) + 간격 = 685px 로 가용폭 1072px 안에 든다.
         *     full 은 1120px 고정이라 혼자 한 줄을 쓸 때만 맞는 값이다.
         * mobile: 아래에서 세로로 쌓으므로 full(343px)이 가용폭 358px 에 들어간다.
         */
        width={device === 'pc' ? 'half' : 'full'}
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
      {/* 모바일은 한 줄에 못 넣는다. 드롭다운(168px)+검색(343px)이 가용폭 358px 를 넘는다. */}
      <div className="flex w-full min-w-0 flex-col items-stretch gap-2 pc:hidden">
        {controls('mobile')}
      </div>
    </>
  )
}
