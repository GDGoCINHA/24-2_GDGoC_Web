/**
 * 소모임 하위 화면(활동 기록 작성·일정·QR·정보 수정)의 「뒤로」 대상.
 *
 * 같은 화면을 소모임 상세에서도, 리더 관리 화면의 바로가기에서도 연다. 관리 화면에서 들어오면 주소에
 * `from=manage` 가 붙고, 그때는 관리 화면으로 돌아가야 한다 — 상세로 보내면 리더가 관리를 이어 갈 수 없다.
 */
export const FROM_MANAGE_PARAM = 'from=manage'

export const isFromManage = (searchParams: { get(name: string): string | null }): boolean =>
  searchParams.get('from') === 'manage'

export const clubBackTarget = (
  clubId: number,
  fromManage: boolean
): { href: string; label: string } =>
  fromManage
    ? { href: `/club/manage/?id=${clubId}`, label: '소모임 관리로' }
    : { href: `/club/detail/?id=${clubId}`, label: '소모임으로' }
