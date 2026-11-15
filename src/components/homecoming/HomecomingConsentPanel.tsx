'use client'

import { useCallback, useEffect, useState } from 'react'

import {
  ADMIN_EMPTY_CELL,
  ADMIN_ERROR_BANNER,
  ADMIN_GHOST_BUTTON,
  ADMIN_OPTION,
  ADMIN_PILL,
  ADMIN_PILL_SELECT,
  ADMIN_TABLE_CARD,
  ADMIN_TD,
  ADMIN_TD_MUTED,
  ADMIN_TH,
  ADMIN_TR
} from '@/components/admin/dashboard/adminStyles'
import { readErrorMessage } from '@/components/homecoming/readErrorMessage'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import {
  fetchHomecomingConsents,
  withdrawHomecomingConsent
} from '@/services/homecoming/homecomingAdminClient'
import {
  CONSENT_PURPOSE_LABEL,
  CONSENT_STATE_LABEL,
  ROLE_LABEL,
  type ConsentPurpose,
  type ConsentState,
  type HomecomingConsentEntry
} from '@/types/homecoming'
import { formatDate } from '@/utils/formatDate'

const STATE_CHOICES: { value: ConsentState | ''; label: string }[] = [
  { value: '', label: '동의한 사람 전체' },
  { value: 'ACTIVE', label: '이용 가능' },
  { value: 'EXPIRED', label: '기한 만료 (삭제 대상)' },
  { value: 'WITHDRAWN', label: '철회 (삭제 대상)' }
]

/**
 * 선택 동의(이후 행사 초청 · OB 인재풀) 목록. 장기 이용 범위인 이름·전화번호·활동 기간·구분만 보여준다.
 *
 * 신청자가 HR팀원에게 철회를 요청하면 여기서 기록한다. 기록만 남기며 개인정보 삭제는 하지 않는다.
 */
export default function HomecomingConsentPanel() {
  const { apiClient } = useAuthenticatedApi()
  const [purpose, setPurpose] = useState<ConsentPurpose>('EVENT_INVITE')
  const [state, setState] = useState<ConsentState | ''>('')
  const [rows, setRows] = useState<HomecomingConsentEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setRows(await fetchHomecomingConsents(apiClient, purpose, state || undefined))
    } catch (e) {
      setError(readErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [apiClient, purpose, state])

  useEffect(() => {
    void load()
  }, [load])

  const handleWithdraw = async (row: HomecomingConsentEntry) => {
    const ok = window.confirm(
      `${row.name}(${row.phone}) 님의 '${CONSENT_PURPOSE_LABEL[row.purpose]}' 동의 철회를 기록합니다. 되돌릴 수 없습니다.`
    )
    if (!ok) return
    setError(null)
    try {
      await withdrawHomecomingConsent(apiClient, row.applicationId, row.purpose)
      await load()
    } catch (e) {
      setError(readErrorMessage(e))
    }
  }

  return (
    <div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <label className={ADMIN_PILL}>
          <span className="text-[13px] text-admin-ink-dim">목적</span>
          <select
            className={ADMIN_PILL_SELECT}
            value={purpose}
            onChange={(e) => setPurpose(e.target.value as ConsentPurpose)}
          >
            {(Object.keys(CONSENT_PURPOSE_LABEL) as ConsentPurpose[]).map((p) => (
              <option key={p} value={p} className={ADMIN_OPTION}>
                {CONSENT_PURPOSE_LABEL[p]}
              </option>
            ))}
          </select>
        </label>
        <label className={ADMIN_PILL}>
          <span className="text-[13px] text-admin-ink-dim">상태</span>
          <select
            className={ADMIN_PILL_SELECT}
            value={state}
            onChange={(e) => setState(e.target.value as ConsentState | '')}
          >
            {STATE_CHOICES.map((choice) => (
              <option key={choice.label} value={choice.value} className={ADMIN_OPTION}>
                {choice.label}
              </option>
            ))}
          </select>
        </label>
        <p className="text-[13px] text-admin-ink-dim">
          {rows.length}명 · 기한 2027.12.31 · 이름·전화번호·활동 기간·구분만 이용
        </p>
      </div>

      {error && <p className={ADMIN_ERROR_BANNER}>{error}</p>}

      <div className={`${ADMIN_TABLE_CARD} mt-5`}>
        <table className="w-full min-w-[820px] border-collapse">
          <thead>
            <tr>
              <th className={ADMIN_TH}>이름</th>
              <th className={ADMIN_TH}>전화번호</th>
              <th className={ADMIN_TH}>활동 기간</th>
              <th className={ADMIN_TH}>활동 구분</th>
              <th className={ADMIN_TH}>상태</th>
              <th className={ADMIN_TH}>동의일</th>
              <th className={ADMIN_TH}>안내문 버전</th>
              <th className={ADMIN_TH}>
                <span className="sr-only">관리</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !loading ? (
              <tr>
                <td className={ADMIN_EMPTY_CELL} colSpan={8}>
                  해당하는 사람이 없습니다.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={`${row.applicationId}-${row.purpose}`} className={ADMIN_TR}>
                  <td className={ADMIN_TD}>{row.name}</td>
                  <td className={`${ADMIN_TD_MUTED} tabular-nums`}>{row.phone}</td>
                  <td className={ADMIN_TD_MUTED}>
                    {row.yearStart ? `${row.yearStart} ~ ${row.yearEnd}` : '—'}
                  </td>
                  <td className={ADMIN_TD_MUTED}>
                    {row.memberRole ? ROLE_LABEL[row.memberRole] : '—'}
                  </td>
                  <td className={ADMIN_TD}>{CONSENT_STATE_LABEL[row.state]}</td>
                  <td className={ADMIN_TD_MUTED}>{formatDate(row.decidedAt)}</td>
                  <td className={ADMIN_TD_MUTED}>{row.noticeVersion}</td>
                  <td className={ADMIN_TD}>
                    {row.state === 'ACTIVE' && (
                      <button
                        type="button"
                        className={ADMIN_GHOST_BUTTON}
                        onClick={() => handleWithdraw(row)}
                      >
                        철회 기록
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
