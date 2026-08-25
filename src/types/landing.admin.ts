export type RecruitType = 'CORE' | 'MEMBER'

/**
 * 관리자 화면이 보는 모집 기간.
 *
 * `overridden` 이 false 면 서버 설정값을 쓰고 있다는 뜻이다. 이걸 알아야 '내가 저장한 값이
 * 먹고 있는지'와 '설정값으로 되돌리기'가 의미를 갖는다.
 */
export type RecruitPeriodAdmin = {
  openAt: string
  closeAt: string
  overridden: boolean
}
