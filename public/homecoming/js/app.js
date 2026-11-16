import { CONFIG, QA, isClosed } from './config.js';
import { submitApplication, ApiError, resetMock } from './api.js';

// ── 상수 ────────────────────────────────────────────────
const ATTEND = [
  { value: 'main', label: '본 행사만 참석', sub: '13:00 ~ 18:30' },
  { value: 'after', label: '뒤풀이만 참석', sub: '18:30 이후' },
  { value: 'both', label: '본 행사 + 뒤풀이', sub: '본 행사와 뒤풀이 모두 참석' },
  { value: 'maybe', label: '아직 미정', sub: '가까워지면 한 번 더 연락드릴게요' },
  { value: 'no', label: '참석이 어려워요', sub: '' },
].filter((o) => CONFIG.SHOW_DECLINE_OPTION || o.value !== 'no');
const ATTEND_LABEL = Object.fromEntries(ATTEND.map((o) => [o.value, o.label]));
const YEARS = ['2021', '2022', '2023', '2024', '2025', '2026'];
const TEAMS = [
  ['Organizer', '동아리 운영 전반과 멤버 관리 총괄'],
  ['HR', '멤버 모집·코어 채용, 네트워킹 행사, 회비·예산 관리'],
  ['BD', '행사·프로그램 기획 운영, 외부 협업·스폰서십, 스터디·프로젝트 성과 관리'],
  ['Tech', '동아리 홈페이지 기획·개발·운영, 홈페이지를 활용한 홍보물 제작'],
  ['PR·Design', '카드뉴스·포스터·굿즈 디자인, 행사 인쇄물, 브랜딩·홍보'],
];
const ARRIVALS = ['14:00', '15:00', '16:00', '17:00', '18:00'];
const MSG_MAX = 1000;
const NAME_MAX = 50;
const APPLIED_KEY = 'hc2026_applied';

const PATHS = {
  main: ['attend', 'basic', 'activity', 'extra', 'confirm'],
  both: ['attend', 'basic', 'activity', 'extra', 'confirm'],
  after: ['attend', 'basic', 'activity', 'confirm'],
  maybe: ['attend', 'basic', 'activity', 'confirm'],
  no: ['attend', 'basic', 'confirm'],
};
const pathOf = (attend) => PATHS[attend] || PATHS.main;
const hasExtra = (a) => a === 'main' || a === 'both';

// ── 상태 ────────────────────────────────────────────────
const blank = () => ({
  attend: null, name: '', phone: '', yearStart: '', yearEnd: '', role: 'organizer', team: null, // 모두 운영진이라 구분을 묻지 않는다
  isLate: false, arrival: '', message: '', privacy: false, invite: false, talent: false,
});
let form = blank();
let touched = new Set();
let stepIndex = 0;
let open = false;
let completed = null; // 완료 시 참석 유형
let submitting = false;
let idemKey = '';
let closingViaHistory = false;
let lastFocus = null;

// ── DOM ────────────────────────────────────────────────
const $ = (s, r = document) => r.querySelector(s);
const page = $('#page');
const fab = $('#fab');
const sheet = $('#sheet');
const body = $('#sheet-body');
const foot = $('#sheet-foot');
const btnPrev = $('#btn-prev');
const btnClose = $('#btn-close');
const btnNext = $('#btn-next');
const stepCount = $('#step-count');
const progressBar = $('#progress-bar');
const submitError = $('#submit-error');
const confirmDlg = $('#confirm');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const storage = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* noop */ } },
  del(k) { try { localStorage.removeItem(k); } catch { /* noop */ } },
};

// ── 검증 ────────────────────────────────────────────────
const digits = (s) => s.replace(/\D/g, '');
function formatPhone(v) {
  const d = digits(v).slice(0, 11);
  if (d.length < 4) return d;
  if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}
const errors = {
  name: () => (form.name.trim() ? '' : '이름을 입력해 주세요.'),
  phone: () => (/^010\d{8}$/.test(digits(form.phone)) ? '' : '전화번호 11자리를 입력해 주세요.'),
  years: () => (form.yearStart && form.yearEnd && +form.yearEnd < +form.yearStart ? '마지막 연도는 시작 연도와 같거나 이후여야 해요.' : ''),
  arrival: () => (form.isLate && !form.arrival ? '도착 예상 시간을 선택해 주세요.' : ''),
};
function stepValid(id) {
  switch (id) {
    case 'attend': return !!form.attend;
    case 'basic': return !errors.name() && !errors.phone();
    case 'activity':
      return !!form.yearStart && !!form.yearEnd && !errors.years() && !!form.team;
    case 'extra': return !errors.arrival() && form.message.length <= MSG_MAX;
    case 'confirm': return form.privacy;
    default: return false;
  }
}

// 숨겨진 단계·필드 값을 제거한 최종 저장값
function buildPayload() {
  const a = form.attend;
  const withActivity = a !== 'no';
  const organizer = withActivity && form.role === 'organizer';
  const extra = hasExtra(a);
  const late = extra && form.isLate;
  return {
    requestId: idemKey,
    attendType: a,
    name: form.name.trim(),
    phone: formatPhone(form.phone),
    yearStart: withActivity ? +form.yearStart : null,
    yearEnd: withActivity ? +form.yearEnd : null,
    memberRole: withActivity ? form.role : null,
    team: organizer ? form.team : null,
    isLate: late,
    arrivalTime: late ? form.arrival : null,
    message: extra && form.message.trim() ? form.message.trim() : null,
    privacyAgreed: form.privacy,
    eventInviteAgreed: form.invite,
    talentPoolAgreed: form.talent,
    consentVersion: CONFIG.CONSENT_VERSION,
  };}
const isDirty = () => !completed && JSON.stringify(form) !== JSON.stringify(blank());

// ── 단계 렌더 ───────────────────────────────────────────
function head(title, desc) {
  return `<h2 class="step-title" id="step-title" tabindex="-1">${title}</h2><p class="step-desc">${desc}</p>`;
}
function errSlot(id, msg) {
  return `<p class="error" id="${id}-err" role="alert">${msg ? esc(msg) : ''}</p>`;
}
const showErr = (key) => touched.has(key);

const RENDER = {
  attend() {
    return `${head('참석 여부를<br />선택해 주세요', '참석 인원과 프로그램별 참여 인원을 파악하기 위해 필요해요.')}
      <fieldset><legend class="sr-only">참석 여부</legend><div class="choices">
      ${ATTEND.map((o) => `<label class="choice"><input type="radio" name="attend" value="${o.value}" ${form.attend === o.value ? 'checked' : ''} />
        <span class="choice-box"><b>${o.label}</b>${o.sub ? `<small>${o.sub}</small>` : ''}</span></label>`).join('')}
      </div></fieldset>`;
  },
  basic() {
    const ne = showErr('name') ? errors.name() : '';
    const pe = showErr('phone') ? errors.phone() : '';
    return `${head('이름과 연락처를<br />입력해 주세요', '참석자를 확인하고 행사 안내를 보내기 위해 필요해요.')}
      <div class="field"><label class="label" for="f-name">이름</label>
        <input class="input" id="f-name" name="name" autocomplete="name" maxlength="${NAME_MAX}" placeholder="이름을 입력해 주세요"
          value="${esc(form.name)}" aria-describedby="name-err" ${ne ? 'aria-invalid="true"' : ''} />${errSlot('name', ne)}</div>
      <div class="field"><label class="label" for="f-phone">전화번호</label>
        <input class="input" id="f-phone" name="phone" type="tel" inputmode="numeric" autocomplete="tel-national" placeholder="010-0000-0000"
          maxlength="13" value="${esc(form.phone)}" aria-describedby="phone-err" ${pe ? 'aria-invalid="true"' : ''} />${errSlot('phone', pe)}</div>`;
  },
  activity() {
    const ye = errors.years();
    const opt = (sel, ph) => `<option value="" ${!sel ? 'selected' : ''} disabled>${ph}</option>` +
      YEARS.map((y) => `<option value="${y}" ${sel === y ? 'selected' : ''}>${y}</option>`).join('');
    return `${head('활동 기간과 팀을<br />선택해 주세요', '명찰에 활동 정보를 표시하기 위해 필요해요.')}
      <fieldset><legend>활동 기간 <em>필수</em></legend>
        <div class="row">
          <select class="select" name="yearStart" aria-label="시작 연도" aria-describedby="years-err" ${ye ? 'aria-invalid="true"' : ''}>${opt(form.yearStart, '시작 연도')}</select>
          <span class="tilde" aria-hidden="true">~</span>
          <select class="select" name="yearEnd" aria-label="마지막 연도" aria-describedby="years-err years-help" ${ye ? 'aria-invalid="true"' : ''}>${opt(form.yearEnd, '마지막 연도')}</select>
        </div>${errSlot('years', ye)}
        <p class="help" id="years-help">1년간 활동했다면 시작·마지막 연도를 같게 선택해 주세요.</p>
      </fieldset>
      <fieldset id="team-field"><legend>활동 팀 <em>필수 · 1개 선택</em></legend>
        ${form.team ? '' : '<p class="help" style="margin:0 2px 10px">활동한 팀을 선택해 주세요.</p>'}
        <div class="choices">
          ${TEAMS.map(([t, d]) => `<label class="choice"><input type="radio" name="team" value="${t}" ${form.team === t ? 'checked' : ''} />
            <span class="choice-box"><b>${t}</b><span class="desc">${d}</span></span></label>`).join('')}
        </div>
        <p class="help">팀 이름이 달랐다면 역할이 비슷한 팀을 선택해 주세요.<br />여러 팀에서 활동했다면 가장 오래 활동한 팀을 선택해 주세요.</p>
      </fieldset>
      <div class="summary-chip ${activitySummary() ? '' : 'empty'}" aria-live="polite">${activitySummary() || '시작 연도 ~ 마지막 연도 · 활동 팀'}</div>`;
  },
  extra() {
    const ae = showErr('arrival') ? errors.arrival() : '';
    return `${head('도착 시간과 요청사항을<br />알려주세요', '도착 일정과 요청사항을 행사 준비에 반영하기 위해 필요해요.')}
      <p class="optional-hint">선택 사항이에요. 입력하지 않아도 돼요.</p>
      <div class="switch-row"><label for="f-late">늦게 도착할 것 같아요</label>
        <span class="switch"><input type="checkbox" role="switch" id="f-late" name="isLate" ${form.isLate ? 'checked' : ''} /><span></span></span></div>
      ${form.isLate ? `<div class="field"><label class="label" for="f-arrival">예상 도착 시간</label>
        <select class="select" id="f-arrival" name="arrival" aria-describedby="arrival-err" ${ae ? 'aria-invalid="true"' : ''}>
          <option value="" disabled ${!form.arrival ? 'selected' : ''}>시간을 선택해 주세요</option>
          ${ARRIVALS.map((t) => `<option ${form.arrival === t ? 'selected' : ''}>${t}</option>`).join('')}
        </select>${errSlot('arrival', ae)}</div>` : ''}
      <div class="field" style="margin-top:12px"><label class="label" for="f-msg">문의·요청사항</label>
        <textarea class="textarea" id="f-msg" name="message" maxlength="${MSG_MAX}" placeholder="문의나 요청사항을 적어주세요." aria-describedby="msg-count">${esc(form.message)}</textarea>
        <p class="counter" id="msg-count">${form.message.length.toLocaleString()} / 1,000</p></div>`;
  },
  confirm() {
    const p = buildPayload();
    const rows = [['참석', ATTEND_LABEL[p.attendType]], ['이름', p.name], ['전화번호', p.phone]];
    if (p.attendType !== 'no') rows.push(['활동', activitySummary()]);
    if (hasExtra(p.attendType)) rows.push(['도착', p.isLate ? `${p.arrivalTime} 도착 예정` : '정시 도착 예정']);
    const ck = (name, on) => `<input type="checkbox" name="${name}" ${on ? 'checked' : ''} />`;
    return `${head('신청 내용을 확인하고<br />동의 여부를 선택해 주세요', '신청 정보와 개인정보 이용 범위를 최종 확인하기 위해 필요해요.')}
      <dl class="review">${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
      <button type="button" class="btn-secondary" data-action="edit">수정하기</button>

      <div class="consent-group">
        <div class="consent required">
          <label class="check">${ck('privacy', form.privacy)}<span>개인정보 수집·이용 동의 <small>필수</small></span></label>
          <p class="consent-text"><b>수집 항목</b> 이름, 전화번호, 참석 유형, 활동 기간·구분, 운영진 활동 팀, 도착 정보 및 요청사항(입력 시)<br />
            <b>이용 목적</b> 참석 확인, 행사 안내 연락, 명찰 제작<br />
            <b>보유 기간</b> 행사 종료 후 파기<br />동의하지 않으시면 신청이 어려워요.</p>
        </div>
      </div>

      <div class="consent-group">
        <h3>추가 안내 수신 및 인재풀 등록</h3>
        <p>각 항목은 선택 사항이에요. 동의하지 않아도 이번 행사에 신청할 수 있어요.</p>
        ${optConsent('invite', form.invite, '이후 동아리 행사 초청', 'GDGoC INHA 홈커밍·동아리 행사 안내')}
        ${optConsent('talent', form.talent, 'OB 인재풀 등록', 'GDGoC INHA 행사·활동을 위한 연사·멘토·심사위원·프로젝트 협력 참여 제안')}
      </div>`;
    function optConsent(name, on, title, purpose) {
      return `<div class="consent"><label class="check">${ck(name, on)}<span>${title} <small class="opt">선택</small></span></label>
        <p class="consent-text"><b>목적</b> ${purpose}<br /><b>항목</b> 이름·전화번호·활동 기간·활동 구분<br />
          <b>보관·이용 기한</b> 2027년 12월 31일까지<br />개별적으로 연락드린 HR팀원에게 동의 철회를 요청할 수 있어요.<br />동의를 거부해도 이번 행사 신청에 불이익이 없어요.</p></div>`;
    }
  },
};

function activitySummary() {
  const yrs = form.yearStart && form.yearEnd && !errors.years() ? `${form.yearStart} ~ ${form.yearEnd}` : '';
  if (!yrs) return '';
  return form.team ? `${yrs} · ${form.team}` : yrs;
}

function render({ focus = true } = {}) {
  const path = pathOf(form.attend);
  const id = path[stepIndex];
  const total = path.length;
  body.innerHTML = RENDER[id]();
  stepCount.textContent = `${stepIndex + 1}/${total}`;
  stepCount.setAttribute('aria-label', `전체 ${total}단계 중 ${stepIndex + 1}단계`);
  progressBar.style.width = `${((stepIndex + 1) / total) * 100}%`;
  btnPrev.hidden = stepIndex === 0;
  foot.hidden = false;
  btnNext.textContent = id === 'confirm' ? '신청하기' : '다음';
  if (id !== 'confirm') hideSubmitError();
  updateNext();
  body.scrollTop = 0;
  if (focus) $('#step-title', body)?.focus({ preventScroll: true });
}
function updateNext() {
  if (submitting) return;
  const id = pathOf(form.attend)[stepIndex];
  btnNext.disabled = !stepValid(id);
}

// 일부 재렌더 (입력 중 포커스 유지가 필요한 필드는 DOM만 갱신)
function patchActivity() {
  const scroll = body.scrollTop;
  const { name, type, value } = document.activeElement || {};
  body.innerHTML = RENDER.activity();
  body.scrollTop = scroll;
  if (name) {
    const sel = type === 'radio' ? `[name="${name}"][value="${CSS.escape(value)}"]` : `[name="${name}"]`;
    body.querySelector(sel)?.focus({ preventScroll: true });
  }
}

// ── 입력 이벤트 ─────────────────────────────────────────
body.addEventListener('input', (e) => {
  const t = e.target;
  switch (t.name) {
    case 'name':
      form.name = t.value.slice(0, NAME_MAX);
      if (touched.has('name')) setFieldError(t, errors.name());
      break;
    case 'phone': {
      const before = t.value;
      form.phone = formatPhone(before);
      if (t.value !== form.phone) t.value = form.phone;
      if (touched.has('phone') || digits(form.phone).length === 11) { touched.add('phone'); setFieldError(t, errors.phone()); }
      break;
    }
    case 'message':
      form.message = t.value.slice(0, MSG_MAX);
      $('#msg-count').textContent = `${form.message.length.toLocaleString()} / 1,000`;
      break;
  }
  updateNext();
});

body.addEventListener('change', (e) => {
  const t = e.target;
  switch (t.name) {
    case 'attend': {
      form.attend = t.value;
      const total = pathOf(form.attend).length; // 실제 경로 기준 진행 표시
      stepCount.textContent = `1/${total}`;
      stepCount.setAttribute('aria-label', `전체 ${total}단계 중 1단계`);
      progressBar.style.width = `${100 / total}%`;
      break;
    }
    case 'yearStart': case 'yearEnd': form[t.name] = t.value; patchActivity(); break;
    case 'team': form.team = t.value; patchActivity(); break;
    case 'isLate':
      form.isLate = t.checked;
      if (!form.isLate) { form.arrival = ''; touched.delete('arrival'); } // 늦참 해제 시 도착 시간 삭제
      render({ focus: false });
      $('#f-late')?.focus();
      break;
    case 'arrival': form.arrival = t.value; touched.add('arrival'); setFieldError(t, errors.arrival()); break;
    case 'privacy': case 'invite': case 'talent': form[t.name] = t.checked; break;
  }
  updateNext();
});

body.addEventListener('focusout', (e) => {
  const n = e.target.name;
  if (n === 'name' || n === 'phone') {
    if (n === 'phone' && !digits(form.phone)) return; // 빈 칸으로 지나가면 오류 미표시
    if (n === 'name' && !form.name) return;
    touched.add(n);
    setFieldError(e.target, errors[n]());
  }
});

// 입력칸이 키보드에 가려지지 않게
body.addEventListener('focusin', (e) => {
  if (e.target.matches('input:not([type=radio]):not([type=checkbox]), select, textarea')) {
    setTimeout(() => e.target.scrollIntoView({ block: 'center', behavior: 'smooth' }), 300);
  }
});

body.addEventListener('click', (e) => {
  if (e.target.closest('[data-action="edit"]')) history.go(-stepIndex); // 첫 단계로, 값 유지
});
body.addEventListener('submit', (e) => { e.preventDefault(); if (!btnNext.disabled) btnNext.click(); });
body.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.matches('input.input')) { e.preventDefault(); if (!btnNext.disabled) btnNext.click(); }
});

function setFieldError(input, msg) {
  const slot = document.getElementById(`${input.name}-err`);
  if (slot) slot.textContent = msg;
  if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
}

// ── 단계 이동 (history 연동: 기기 뒤로가기 = 이전 단계) ──
btnNext.addEventListener('click', () => {
  if (btnNext.disabled || submitting) return;
  const path = pathOf(form.attend);
  if (path[stepIndex] === 'confirm') return submit();
  history.pushState({ hc: 'sheet', step: stepIndex + 1 }, '', '#apply');
  goTo(stepIndex + 1);
});
btnPrev.addEventListener('click', () => history.back());
btnClose.addEventListener('click', () => requestClose());

function goTo(i) {
  const path = pathOf(form.attend);
  let target = Math.max(0, Math.min(i, path.length - 1));
  for (let k = 0; k < target; k++) if (!stepValid(path[k])) { target = k; break; }
  stepIndex = target;
  render();
}

window.addEventListener('popstate', (e) => {
  const st = e.state;
  if (!open) {
    if (st?.hc === 'sheet') history.replaceState(null, '', location.pathname + location.search); // 닫힌 뒤 앞으로가기
    return;
  }
  if (st?.hc === 'sheet') {
    if (completed) { history.go(-(st.step + 1)); closingViaHistory = true; return; }
    goTo(st.step);
    return;
  }
  // 시트 밖으로 나감 → 닫기
  if (closingViaHistory || !isDirty()) { closingViaHistory = false; closeSheet(); return; }
  history.pushState({ hc: 'sheet', step: stepIndex }, '', '#apply'); // 확인 전까지 시트 유지
  askConfirm();
});

function requestClose() {
  if (isDirty()) return askConfirm();
  exitHistory();
}
function exitHistory() {
  closingViaHistory = true;
  const depth = (history.state?.hc === 'sheet' ? history.state.step : stepIndex) + 1;
  history.go(-depth);
}

// ── 닫기 확인창 ─────────────────────────────────────────
function askConfirm() {
  confirmDlg.hidden = false;
  sheet.inert = true;
  $('#confirm-cancel').focus();
}
function hideConfirm() {
  confirmDlg.hidden = true;
  sheet.inert = false;
}
$('#confirm-cancel').addEventListener('click', () => { hideConfirm(); btnClose.focus(); });
$('#confirm-ok').addEventListener('click', () => { hideConfirm(); exitHistory(); });
confirmDlg.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { hideConfirm(); btnClose.focus(); }
  if (e.key === 'Tab') { // 두 버튼 사이 포커스 순환
    const a = $('#confirm-cancel'), b = $('#confirm-ok');
    if (e.shiftKey && document.activeElement === a) { e.preventDefault(); b.focus(); }
    else if (!e.shiftKey && document.activeElement === b) { e.preventDefault(); a.focus(); }
  }
});
sheet.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && confirmDlg.hidden) requestClose();
  if (e.key === 'Tab') trapFocus(e);
});
function trapFocus(e) {
  const f = [...sheet.querySelectorAll('button, input, select, textarea, [tabindex="0"]')]
    .filter((el) => !el.disabled && el.offsetParent !== null && !el.closest('[hidden]'));
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && (document.activeElement === first || !sheet.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

// ── 시트 열기·닫기 ──────────────────────────────────────
let scrollY = 0;
function openSheet() {
  if (open || isClosed() || storage.get(APPLIED_KEY)) return;
  open = true;
  lastFocus = document.activeElement;
  form = blank(); touched = new Set(); completed = null; stepIndex = 0;
  idemKey = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  history.pushState({ hc: 'sheet', step: 0 }, '', '#apply');
  // 배경 스크롤·상호작용 차단 (iOS 대응 position:fixed)
  scrollY = window.scrollY;
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = '100%';
  document.body.classList.add('locked');
  page.inert = true; fab.inert = true;
  page.setAttribute('aria-hidden', 'true');
  sheet.hidden = false;
  render();
}
function closeSheet() {
  open = false;
  hideConfirm();
  sheet.hidden = true;
  page.inert = false; fab.inert = false;
  page.removeAttribute('aria-hidden');
  document.body.classList.remove('locked');
  document.body.style.position = ''; document.body.style.top = ''; document.body.style.width = '';
  window.scrollTo(0, scrollY);
  form = blank(); // 닫은 뒤 임시 저장 없음
  updateFab();
  const back = [lastFocus, fab].find((el) => el && el !== document.body && document.contains(el) && !el.disabled);
  if (back) back.focus({ preventScroll: true });
  else { const h = $('#apply-title'); h.tabIndex = -1; h.focus({ preventScroll: true }); } // 완료로 버튼이 비활성화된 경우
}

// ── 제출 ────────────────────────────────────────────────
async function submit() {
  if (submitting) return;
  if (isClosed()) return showSubmitError('신청 마감', '개별적으로 연락드린 HR팀원에게 답장해 주세요');
  submitting = true;
  hideSubmitError();
  btnNext.disabled = true;
  btnNext.setAttribute('aria-busy', 'true');
  btnNext.innerHTML = '<span class="spinner" aria-hidden="true"></span>신청하는 중';
  body.inert = true; btnPrev.disabled = true;
  try {
    await submitApplication(buildPayload());
    submitting = false;
    showComplete(form.attend);
  } catch (err) {
    submitting = false;
    const code = err instanceof ApiError ? err.code : 'NETWORK';
    if (code === 'DUPLICATE_PHONE') showSubmitError('이미 신청하셨어요', '변경은 개별적으로 연락드린 HR팀원에게 답장 주세요');
    else if (code === 'CLOSED') showSubmitError('신청 마감', '개별적으로 연락드린 HR팀원에게 답장해 주세요');
    else if (code === 'VALIDATION') showSubmitError('입력값을 다시 확인해 주세요', '수정하기를 눌러 내용을 확인한 뒤 다시 신청해 주세요.');
    else showSubmitError('신청을 저장하지 못했어요', '네트워크 상태를 확인하고 다시 시도해 주세요. 작성한 내용은 그대로 있어요.');
    btnNext.textContent = code === 'NETWORK' || code === 'SERVER' ? '다시 시도' : '신청하기';
  } finally {
    btnNext.removeAttribute('aria-busy');
    body.inert = false; btnPrev.disabled = false;
    if (!completed) updateNext();
  }
}
function showSubmitError(title, msg) {
  submitError.innerHTML = `<b>${esc(title)}</b>${esc(msg)}`;
  submitError.hidden = false;
}
function hideSubmitError() { submitError.hidden = true; submitError.textContent = ''; }

// ── 완료 ────────────────────────────────────────────────
const DONE_COPY = {
  // 미정·불참 제목은 확인 필요
  main: ['참석 신청이 완료됐어요.', '13:30까지 와주세요. 세부 장소는 다시 안내드릴게요.'],
  both: ['참석 신청이 완료됐어요.', '13:30까지 와주세요. 세부 장소는 다시 안내드릴게요.'],
  after: ['참석 신청이 완료됐어요.', '뒤풀이 장소는 다시 안내드릴게요.'],
  maybe: ['응답이 접수됐어요.', '가까워지면 한 번 더 연락드릴게요.'],
  no: ['응답이 접수됐어요.', '응답해 주셔서 감사해요.'],
};
function showComplete(type) {
  completed = type;
  storage.set(APPLIED_KEY, type);
  const [title, msg] = DONE_COPY[type];
  const cal = CONFIG.CALENDAR_ENABLED && ['main', 'after', 'both'].includes(type);
  stepCount.textContent = ''; stepCount.removeAttribute('aria-label');
  progressBar.style.width = '100%';
  btnPrev.hidden = true;
  foot.hidden = true;
  hideSubmitError();
  btnNext.textContent = '신청하기';
  body.innerHTML = `<div class="done">
      <div class="done-mark" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
      <h2 class="step-title" id="step-title" tabindex="-1">${title}</h2>
      <p>${msg}</p>
      <div class="done-contact"><b>변경·취소 및 문의</b><p>개별적으로 연락드린 HR팀원에게 답장해 주세요.</p></div>
      <div class="done-actions">
        ${cal ? '<button type="button" class="btn-secondary" data-action="calendar">캘린더에 추가</button>' : ''}
        <button type="button" class="btn-primary" data-action="home">행사 안내로 돌아가기</button>
      </div></div>`;
  body.querySelector('[data-action="home"]').addEventListener('click', exitHistory);
  body.querySelector('[data-action="calendar"]')?.addEventListener('click', () => downloadIcs(type));
  $('#step-title', body).focus();
}

// ── 캘린더 (.ics) ───────────────────────────────────────
function downloadIcs(type) {
  // 시각은 UTC로 기록 (KST 13:00 = 04:00Z, 18:30 = 09:30Z). 뒤풀이 종료 시각 미정 → DTEND 생략
  const ev = {
    main: { start: '20261219T040000Z', end: '20261219T093000Z', loc: '인하대학교 용현캠퍼스 (세부 장소 추후 안내)' },
    both: { start: '20261219T040000Z', end: null, loc: '본 행사: 인하대학교 용현캠퍼스 (세부 장소 추후 안내) / 뒤풀이: 장소 추후 안내' },
    after: { start: '20261219T093000Z', end: null, loc: '뒤풀이 장소 추후 안내' },
  }[type];
  const desc = type === 'after'
    ? '뒤풀이(After Party)는 18:30 이후 시작해요. 장소는 다시 안내드려요.'
    : '13:30까지 와주세요. 세부 장소는 다시 안내드려요. 준비물: 1만 원 이내의 작은 선물';
  const icsEsc = (s) => s.replace(/[\\;,]/g, (c) => `\\${c}`);
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//GDGoC INHA//Homecoming 2026//KO', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT', `UID:homecoming-2026-${type}@gdgocinha.com`, 'DTSTAMP:20261112T000000Z',
    `DTSTART:${ev.start}`, ev.end ? `DTEND:${ev.end}` : null,
    `SUMMARY:${icsEsc('2026 GDGoC INHA HomeComing Day')}`, `LOCATION:${icsEsc(ev.loc)}`, `DESCRIPTION:${icsEsc(desc)}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].filter(Boolean);
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gdgoc-inha-homecoming-2026.ics';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

// ── 신청 버튼 상태 ──────────────────────────────────────
function updateFab() {
  const label = $('.fab-label', fab);
  const closed = isClosed();
  const applied = storage.get(APPLIED_KEY);
  $('#closed-note').hidden = !closed;
  if (applied) { label.textContent = '신청 완료'; fab.disabled = true; fab.setAttribute('aria-label', '신청 완료'); }
  else if (closed) { label.textContent = '신청 마감'; fab.disabled = true; fab.setAttribute('aria-label', '신청 마감'); }
  else { label.textContent = '참석 신청하기'; fab.disabled = false; fab.setAttribute('aria-label', '참석 신청하기'); }
}
fab.addEventListener('click', openSheet);
let ticking = false;
window.addEventListener('scroll', () => {
  if (ticking || open) return;
  ticking = true;
  requestAnimationFrame(() => { fab.classList.toggle('compact', window.scrollY > 160); ticking = false; });
}, { passive: true });

// 키보드가 올라오면 시트 높이를 visual viewport에 맞춤
if (window.visualViewport) {
  const sync = () => document.documentElement.style.setProperty('--vvh', `${window.visualViewport.height}px`);
  visualViewport.addEventListener('resize', sync);
  sync();
}

// ── 시작 ────────────────────────────────────────────────
if (QA === 'reset') { resetMock(); storage.del(APPLIED_KEY); }
updateFab();
if (location.hash === '#apply') {
  history.replaceState(null, '', location.pathname + location.search); // 바로가기: 뒤로가기 시 안내 화면으로
  openSheet();
}
window.addEventListener('hashchange', () => { if (location.hash === '#apply' && !open) { history.replaceState(null, '', location.pathname + location.search); openSheet(); } });
