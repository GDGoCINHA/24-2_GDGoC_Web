'use client'

import { ClubAdminFrame } from '@/components/club/admin/ClubAdminFrame'
import {
  ADMIN_ACCENT_BUTTON,
  ADMIN_ACCENT_BUTTON_SM,
  ADMIN_GHOST_BUTTON,
  ADMIN_SEARCH_FIELD,
  ADMIN_SEARCH_INPUT
} from '@/components/admin/dashboard/adminStyles'
import { MOCK_LEADER_GRANTS, MOCK_OPEN_REQUESTS } from '@/mock/clubMock'

const CARD =
  'flex flex-col gap-3 rounded-[20px] border border-admin-line-soft bg-admin-card p-[22px] shadow-admin'
const FIELD =
  'rounded-xl border border-admin-line bg-admin-base px-4 py-3 text-[14px] text-admin-ink outline-none focus:border-admin-accent'

/** 개설 신청 처리·이끔이 권한(A 담당), 기수 설정(C 담당). */
export default function ClubLeadersPage() {
  return (
    <ClubAdminFrame eyebrow="Clubs" title="이끔이 · 기수" current="이끔이·기수">
      <div className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] items-start gap-5 mobile:grid-cols-1">
        <div className="flex flex-col gap-5">
          <section className={CARD}>
            <h2 className="text-[17px] font-semibold">
              개설 신청 <span className="text-admin-accent">{MOCK_OPEN_REQUESTS.length}</span>
            </h2>
            {MOCK_OPEN_REQUESTS.map((request) => (
              <div
                key={request.id}
                className="flex flex-wrap items-center gap-3 rounded-[14px] border border-admin-line-soft px-4 py-3.5"
              >
                <div className="min-w-0 flex-[1_1_260px]">
                  <div className="text-[15px] font-semibold">
                    {request.name}{' '}
                    <span className="text-[12px] font-normal text-admin-ink-muted">
                      {request.category} · 신청 {request.who}
                    </span>
                  </div>
                  <div className="mt-1.5 text-[13px] leading-[1.55] text-admin-ink-muted">
                    {request.goal}
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button type="button" className={ADMIN_GHOST_BUTTON}>
                    거절
                  </button>
                  <button type="button" className={ADMIN_ACCENT_BUTTON_SM}>
                    승인
                  </button>
                </div>
              </div>
            ))}
          </section>

          <section className={CARD}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-[17px] font-semibold">이끔이 권한 보유자</h2>
              <div className="flex flex-wrap gap-1.5">
                <label className={ADMIN_SEARCH_FIELD}>
                  <span className="sr-only">권한 줄 사람 검색</span>
                  <input type="text" placeholder="이름 또는 학번" className={ADMIN_SEARCH_INPUT} />
                </label>
                <button type="button" className={ADMIN_ACCENT_BUTTON_SM}>
                  권한 주기
                </button>
              </div>
            </div>
            <ul>
              {MOCK_LEADER_GRANTS.map((grant) => (
                <li
                  key={grant.userId}
                  className="flex items-center gap-3 border-t border-admin-line-row py-2.5 text-[14px]"
                >
                  <span className="font-semibold">{grant.name}</span>
                  <span className="text-[13px] text-admin-ink-soft">{grant.clubs}</span>
                  <button
                    type="button"
                    className="ml-auto min-h-9 text-[13px] text-admin-ink-muted hover:text-admin-ink"
                  >
                    회수
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className={CARD}>
          <h2 className="text-[17px] font-semibold">기수</h2>
          <div className="flex flex-col gap-3 rounded-[14px] border border-admin-line-accent p-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] text-admin-ink-muted">기수 이름</span>
              <input type="text" defaultValue="2026-2학기" className={FIELD} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] text-admin-ink-muted">회차별 참석 비율 (%)</span>
              <input
                type="number"
                min={1}
                max={100}
                defaultValue={50}
                className={`${FIELD} w-[120px]`}
              />
              <span className="text-[12px] text-admin-ink-soft">
                팀원 6명이면 회차마다 3명 이상 참석해야 인정돼요
              </span>
            </label>
            <button type="button" className={`${ADMIN_ACCENT_BUTTON} self-end`}>
              저장
            </button>
          </div>
          <div className="flex justify-between px-1 pt-3 text-[14px] text-admin-ink-muted">
            <span>2026-1학기</span>
            <span>참석 비율 50%</span>
          </div>
          <button type="button" className={`${ADMIN_GHOST_BUTTON} self-start`}>
            새 기수 만들기
          </button>
        </section>
      </div>
    </ClubAdminFrame>
  )
}
