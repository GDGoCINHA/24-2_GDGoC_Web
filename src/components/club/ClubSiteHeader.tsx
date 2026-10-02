'use client'

import { BOARD_MENUS } from '@/components/board/boardMenus'
import { GdgSiteHeader } from '@/components/ui/design-system'
import { useAuth } from '@/hooks/useAuth'

/** 소모임 화면 머리. 게시판과 같은 메뉴를 써서 서로 오갈 수 있게 한다. */
export function ClubSiteHeader() {
  const { user } = useAuth()
  return (
    <GdgSiteHeader
      menus={BOARD_MENUS}
      actionMenu={{
        label: user ? '내 정보' : '로그인',
        url: user ? '/profile/' : '/login?next=%2Fclub%2F'
      }}
    />
  )
}
