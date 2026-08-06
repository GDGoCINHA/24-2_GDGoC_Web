import type { GdgMenuLink } from '@/components/ui/design-system'

/**
 * 게시판 페이지들이 공유하는 헤더 메뉴.
 *
 * 페이지마다 자기 게시판만 넣어두면 다른 게시판으로 갈 수단이 사라진다 —
 * 실제로 공지 게시판에서 행사 게시판으로 이동할 방법이 없었다.
 * 게시판이 늘어날 때 여기 한 곳만 고치면 8개 페이지가 함께 맞는다.
 */
export const BOARD_MENUS: GdgMenuLink[] = [
  { label: '행사', url: '/board/events/' },
  { label: '공지사항', url: '/board/notices/' },
  { label: '자유게시판', url: '/board/free/' }
]
