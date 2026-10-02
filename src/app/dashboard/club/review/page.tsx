'use client'

import Link from 'next/link'
import { useState } from 'react'

import { ClubAdminFrame } from '@/components/club/admin/ClubAdminFrame'
import { ADMIN_ACCENT_BUTTON, ADMIN_GHOST_BUTTON } from '@/components/admin/dashboard/adminStyles'
import { MOCK_REVIEW_QUEUE } from '@/mock/clubMock'
import { cn } from '@/utils/cn'

/**
 * 인증 검토 (C 담당). 인증 완료하면 그 기록은 이끔이가 더 이상 고칠 수 없다.
 */
export default function ClubReviewPage() {
  // TODO(C): GET /api/v1/admin/club-activities?status=PENDING 으로 바꾼다.
  const queue = MOCK_REVIEW_QUEUE
  const [selectedId, setSelectedId] = useState(queue[0]?.id)
  const current = queue.find((item) => item.id === selectedId) ?? queue[0]

  return (
    <ClubAdminFrame
      eyebrow="Clubs"
      title="인증 검토"
      current="인증 검토"
      aside={<span className="text-[14px] text-admin-ink-soft">확인 중 {queue.length}건</span>}
    >
      <div className="grid grid-cols-[360px_minmax(0,1fr)] items-start gap-5 mobile:grid-cols-1">
        <ul className="overflow-hidden rounded-[20px] border border-admin-line-soft bg-admin-card shadow-admin">
          {queue.map((item) => {
            const met = item.attended >= item.required
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={cn(
                    'block w-full border-b border-admin-line-row px-[18px] py-3.5 text-left text-[14px] transition-colors',
                    item.id === current?.id ? 'bg-admin-badge' : 'hover:bg-admin-row-hover'
                  )}
                >
                  <div className="flex justify-between gap-2">
                    <span className="font-semibold">{item.club}</span>
                    <span className="text-[12px] text-admin-ink-soft">{item.date}</span>
                  </div>
                  <div className="mt-1.5 flex gap-2 text-[12px]">
                    <span className="text-admin-ink-muted">
                      참석 {item.attended} / {item.roster}
                    </span>
                    <span className={met ? 'text-admin-ok' : 'text-admin-accent'}>
                      {met ? '기준 충족' : '기준 미달'}
                    </span>
                    {item.resubmitted && <span className="text-admin-accent">재제출</span>}
                  </div>
                </button>
              </li>
            )
          })}
        </ul>

        {current && (
          <div className="flex flex-col gap-[18px] rounded-[20px] border border-admin-line-soft bg-admin-card p-6 shadow-admin">
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <div className="text-[13px] text-admin-accent">{current.club}</div>
                <div className="mt-1 text-[20px] font-semibold">{current.date} 모임</div>
              </div>
              <Link
                href={`/dashboard/club/team?id=${current.id}`}
                className="text-[13px] text-admin-accent"
              >
                팀 현황 보기 →
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[0, 1, 2].map((index) => (
                <div key={index} className="aspect-[4/3] rounded-xl bg-admin-thead" />
              ))}
            </div>
            <p className="text-[15px] leading-[1.65]">{current.text}</p>
            <div className="flex flex-col gap-2.5 rounded-[14px] border border-admin-line-soft px-4 py-3.5">
              <div className="flex justify-between gap-3 text-[14px]">
                <span className="text-admin-ink-muted">출석 (활동일 당시 명단 기준)</span>
                <span
                  className={
                    current.attended >= current.required ? 'text-admin-ok' : 'text-admin-accent'
                  }
                >
                  {current.attended} / {current.roster} · 필요 {current.required}명
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {current.on.map((name) => (
                  <span
                    key={name}
                    className="rounded-full bg-admin-tag px-2.5 py-1 text-[12px] text-admin-ok"
                  >
                    {name} ✓
                  </span>
                ))}
                {current.off.map((name) => (
                  <span
                    key={name}
                    className="rounded-full border border-admin-line px-2.5 py-1 text-[12px] text-admin-ink-soft"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
            <label className="flex flex-col gap-2">
              <span className="text-[13px] text-admin-ink-muted">
                보완 요청 사유 (보완 요청할 때만)
              </span>
              <textarea
                rows={2}
                placeholder="예: 모임 장면이 보이는 사진을 추가해 주세요"
                className="resize-y rounded-xl border border-admin-line bg-admin-base px-4 py-3 text-[14px] text-admin-ink outline-none focus:border-admin-accent"
              />
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" className={ADMIN_GHOST_BUTTON}>
                보완 요청
              </button>
              <button type="button" className={ADMIN_ACCENT_BUTTON}>
                인증 완료
              </button>
            </div>
          </div>
        )}
      </div>
    </ClubAdminFrame>
  )
}
