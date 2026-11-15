// 신청 API 어댑터.
// CONFIG.API_BASE가 있으면 실제 서버, 없으면 localStorage 목업을 쓴다.
//
// ── 서버 계약 (24-2_GDGoC_Server: domain/homecoming) ──────────
// POST {API_BASE}/api/v1/homecoming/applications   (로그인 불필요)
//   Body    buildPayload() 결과 (camelCase). requestId = 시트를 열 때 만든 UUID
//           ※ 커스텀 헤더는 서버 CORS 허용 목록에 없어 멱등 키도 본문에 넣는다
//   성공    200 { code, message, data: { id, attendType } }
//           같은 requestId 재요청 → 첫 저장 결과를 그대로 반환 (마감 후에도)
//   중복    409  같은 전화번호(취소 건 제외)
//   마감    403  서버 시각 기준 마감 이후
//   검증    400  message 에 사람이 읽을 사유
// ───────────────────────────────────────────────────────────

import { CONFIG, QA, isClosed } from './config.js';

export class ApiError extends Error {
  constructor(code, message) {
    super(message || code);
    this.code = code; // DUPLICATE_PHONE | CLOSED | VALIDATION | NETWORK | SERVER
  }
}

export async function submitApplication(payload) {
  return CONFIG.API_BASE ? submitRemote(payload) : submitMock(payload);
}

async function submitRemote(payload) {
  let res;
  try {
    res = await fetch(`${CONFIG.API_BASE}/api/v1/homecoming/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new ApiError('NETWORK');
  }
  let body = null;
  try { body = await res.json(); } catch { /* 빈 응답 */ }
  if (res.ok) return body?.data ?? {};
  if (res.status === 409) throw new ApiError('DUPLICATE_PHONE');
  if (res.status === 403) throw new ApiError('CLOSED');
  if (res.status === 400) throw new ApiError('VALIDATION', body?.message);
  throw new ApiError('SERVER', body?.message);
}

// ── 목업 ──────────────────────────────────────────────
const DB_KEY = 'hc2026_mock_db';
let qaFailUsed = false;

function readDb() {
  try { return JSON.parse(localStorage.getItem(DB_KEY)) || { records: [], keys: {} }; }
  catch { return { records: [], keys: {} }; }
}
function writeDb(db) {
  try { localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch { /* 저장 불가 환경 */ }
}
export function resetMock() {
  try { localStorage.removeItem(DB_KEY); } catch { /* noop */ }
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function submitMock(payload) {
  const key = payload.requestId;
  await wait(700);
  if (QA === 'fail' && !qaFailUsed) { qaFailUsed = true; throw new ApiError('NETWORK'); }

  const db = readDb();
  if (db.keys[key]) return db.keys[key]; // 재시도: 첫 저장 결과 반환
  if (isClosed()) throw new ApiError('CLOSED');
  if (!payload.privacyAgreed || !payload.name || !/^010-\d{4}-\d{4}$/.test(payload.phone)) {
    throw new ApiError('VALIDATION');
  }
  if (db.records.some((r) => r.phone === payload.phone && !r.cancelled)) throw new ApiError('DUPLICATE_PHONE');

  const result = { id: db.records.length + 1, attendType: payload.attendType };
  db.records.push({ ...payload, id: result.id, submittedAt: new Date().toISOString() });
  db.keys[key] = result;
  writeDb(db);

  if (QA === 'lost' && !qaFailUsed) { qaFailUsed = true; throw new ApiError('NETWORK'); } // 저장은 됐지만 응답 유실
  return result;
}
