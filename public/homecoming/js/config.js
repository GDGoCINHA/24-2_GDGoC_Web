// 운영 설정. '확인 필요' 항목은 운영진 결정 후 이 파일만 고치면 된다.

function apiBaseFor(host) {
  if (host === 'gdgocinha.com' || host === 'www.gdgocinha.com') return 'https://api.gdgocinha.com';
  if (host === 'dev.gdgocinha.com') return 'https://dev-api.gdgocinha.com';
  return '';
}

export const CONFIG = {
  // 백엔드 주소. 이 파일은 Next 번들 밖(public/)이라 NEXT_PUBLIC_BASE_API_URL 을 못 받는다.
  // 그래서 접속한 도메인으로 정한다. 그 밖(localhost 등)은 비워 두어 localStorage 목업을 쓴다.
  API_BASE: apiBaseFor(location.hostname),

  // 신청 마감 (확인 필요: 정확한 마감 시각). 현재 기준 11/22 23:59:59 KST
  DEADLINE: '2026-11-22T23:59:59+09:00',

  // 캘린더 추가 버튼 노출 여부 (확인 필요: 유지 여부)
  CALENDAR_ENABLED: true,

  // 불참 선택지 노출 여부 (확인 필요: 최종 유지 여부)
  SHOW_DECLINE_OPTION: true,

  // 동의 안내문 버전. 문구가 바뀌면 올린다 (consent_records 용)
  CONSENT_VERSION: '2026-11-12.draft',
};

// QA용 쿼리: ?qa=closed (마감 상태), ?qa=fail (첫 제출 네트워크 실패),
// ?qa=lost (저장 후 응답 유실 → 재시도 시 중복 저장 안 되는지 확인), ?qa=reset (목업 DB·완료 상태 초기화)
export const QA = new URLSearchParams(location.search).get('qa') || '';

export function isClosed(now = new Date()) {
  if (QA === 'closed') return true;
  return now.getTime() > new Date(CONFIG.DEADLINE).getTime();
}
