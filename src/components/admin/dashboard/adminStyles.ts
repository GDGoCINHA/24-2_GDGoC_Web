/**
 * 관리자 화면(허브 · Users · Members · Core 지원서 · Core 출석)이 공유하는 클래스.
 *
 * 화면마다 같은 문자열을 다시 적으면 한 곳만 고쳐지고 나머지가 남는다.
 * 색은 `--color-admin-*` 토큰만 쓴다 — HEX 직접 입력은 리포 규칙이 금지한다.
 */

/** 둥근 알약 컨트롤 (셀렉트를 감싸는 라벨) */
export const ADMIN_PILL =
  'flex items-center gap-2.5 rounded-full border border-admin-line bg-admin-card px-4 py-2.5'

/** 알약 안에 들어가는 네이티브 셀렉트 */
export const ADMIN_PILL_SELECT =
  'cursor-pointer border-0 bg-transparent text-[15px] text-admin-ink outline-none'

/** 셀렉트 옵션 — 브라우저가 배경을 상속하지 않아 직접 준다 */
export const ADMIN_OPTION = 'bg-admin-card text-admin-ink'

/** 표 안에서 쓰는 셀렉트 */
export const ADMIN_CELL_SELECT =
  'w-full min-w-[96px] cursor-pointer rounded-[10px] border border-admin-line bg-admin-card px-2.5 py-2 text-[14px] text-admin-ink outline-none transition-colors duration-200 hover:border-admin-accent disabled:cursor-not-allowed disabled:opacity-40'

/** 검색 필드를 감싸는 라벨 */
export const ADMIN_SEARCH_FIELD =
  'flex min-w-0 flex-1 basis-[300px] items-center gap-2.5 rounded-full border border-admin-line bg-admin-card px-4 py-2.5 shadow-admin transition duration-[250ms] focus-within:border-admin-accent focus-within:shadow-admin-ring'

export const ADMIN_SEARCH_INPUT =
  'min-w-0 flex-1 border-0 bg-transparent text-[15px] text-admin-ink outline-none'

/** 강조 버튼 (저장 등) */
export const ADMIN_ACCENT_BUTTON =
  'whitespace-nowrap rounded-full bg-admin-accent px-5 py-2.5 text-[14px] font-medium text-admin-accent-ink transition-colors duration-200 hover:bg-admin-accent-hover disabled:cursor-not-allowed disabled:opacity-60'

/** 강조 버튼의 작은 판 (표 안) */
export const ADMIN_ACCENT_BUTTON_SM =
  'whitespace-nowrap rounded-full bg-admin-accent px-[18px] py-2 text-[13px] font-medium text-admin-accent-ink transition-colors duration-200 hover:bg-admin-accent-hover disabled:cursor-not-allowed disabled:opacity-60'

/** 테두리만 있는 버튼 */
export const ADMIN_GHOST_BUTTON =
  'whitespace-nowrap rounded-full border border-admin-line px-[18px] py-2 text-[13px] text-admin-ink-muted transition-colors duration-200 hover:border-admin-accent hover:text-admin-ink disabled:cursor-not-allowed disabled:opacity-40'

/** 표를 감싸는 카드 — `overflow-hidden` 이 라운드를 지킨다 */
export const ADMIN_TABLE_CARD =
  'overflow-hidden rounded-[20px] border border-admin-line-soft bg-admin-card shadow-admin'

/**
 * 표 헤더 셀. `top-0` 이어야 한다 — 68px 을 주면 첫 행과 겹친다.
 */
export const ADMIN_TH =
  'whitespace-nowrap border-b border-admin-line-soft bg-admin-thead px-3.5 py-2.5 text-left text-[12px] font-medium tracking-[0.06em] text-admin-ink-dim'

export const ADMIN_TH_RIGHT = ADMIN_TH.replace('text-left', 'text-right')

export const ADMIN_TR =
  'border-b border-admin-line-row transition-colors duration-250 hover:bg-admin-row-hover'

export const ADMIN_TD = 'px-3.5 py-2.5 text-[14px] text-admin-ink'

export const ADMIN_TD_MUTED = 'px-3.5 py-2.5 text-[14px] text-admin-ink-soft'

export const ADMIN_EMPTY_CELL = 'px-4 py-[72px] text-center text-[15px] text-admin-ink-dim'

/** 오류 배너 — alert 대신 화면 안에 띄운다 */
export const ADMIN_ERROR_BANNER =
  'mt-4 rounded-2xl border border-admin-line bg-admin-card px-5 py-4 text-[14px] text-signal-err'

/** 화면 바깥 껍데기 */
export const ADMIN_PAGE = 'min-h-screen bg-admin-base pb-12 font-pretendard text-admin-ink'

/** 본문 컨테이너 (표 화면 공통 폭) */
export const ADMIN_CONTAINER = 'mx-auto w-full max-w-[1240px] px-[clamp(20px,4vw,40px)]'

export const ADMIN_CAPTION = 'text-[12px] uppercase tracking-[0.14em] text-admin-ink-dim'

export const ADMIN_TITLE =
  'text-[clamp(22px,2.4vw,30px)] font-semibold leading-[1.2] tracking-[-0.03em]'
