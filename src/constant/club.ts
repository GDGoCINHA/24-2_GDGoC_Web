/**
 * 소모임 진입점(게시판 메뉴, 대시보드 허브)을 보일지.
 *
 * 화면이 아직 목 데이터로 돌아서 운영 빌드에서는 진입점만 숨긴다. 주소로 들어가면 보인다.
 * 기능이 API 에 붙으면 이 상수를 지우고 진입점을 항상 보이게 한다.
 */
export const CLUB_ENTRY_VISIBLE = process.env.NEXT_PUBLIC_APP_ENV !== 'production'
