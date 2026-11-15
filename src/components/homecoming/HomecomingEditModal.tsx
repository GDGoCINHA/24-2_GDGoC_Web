'use client'

import { useEffect, useRef, useState } from 'react'

import {
  ADMIN_ACCENT_BUTTON,
  ADMIN_ERROR_BANNER,
  ADMIN_GHOST_BUTTON,
  ADMIN_OPTION
} from '@/components/admin/dashboard/adminStyles'
import { readErrorMessage } from '@/components/homecoming/readErrorMessage'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import { updateHomecomingApplication } from '@/services/homecoming/homecomingAdminClient'
import {
  ARRIVAL_TIMES,
  ATTEND_LABEL,
  ATTEND_TYPES,
  ROLE_LABEL,
  TEAMS,
  YEARS,
  type AttendType,
  type HomecomingApplication,
  type HomecomingMemberRole,
  type HomecomingTeam
} from '@/types/homecoming'

const FIELD =
  'w-full rounded-xl border border-admin-line bg-admin-card px-3.5 py-2.5 text-[15px] mobile:text-base text-admin-ink outline-none focus:border-admin-accent'
const LABEL = 'mb-1.5 block text-[13px] text-admin-ink-dim'

/**
 * 신청자의 변경 요청을 반영한다. 참석 유형이 받지 않는 칸(불참의 활동 정보, 뒤풀이·미정의 늦참 등)은
 * 숨기고, 저장해도 서버가 비운다. 동의 여부는 여기서 바꾸지 않는다 — 철회는 장기 등록 탭에서 기록한다.
 */
export default function HomecomingEditModal({
  application,
  onClose,
  onSaved
}: {
  application: HomecomingApplication
  onClose: () => void
  onSaved: () => void
}) {
  const { apiClient } = useAuthenticatedApi()
  const [attendType, setAttendType] = useState<AttendType>(application.attendType)
  const [name, setName] = useState(application.name)
  const [phone, setPhone] = useState(application.phone)
  const [yearStart, setYearStart] = useState(application.yearStart ?? 0)
  const [yearEnd, setYearEnd] = useState(application.yearEnd ?? 0)
  const [memberRole, setMemberRole] = useState<HomecomingMemberRole | ''>(
    application.memberRole ?? ''
  )
  const [team, setTeam] = useState<HomecomingTeam | ''>(application.team ?? '')
  const [late, setLate] = useState(application.late)
  const [arrivalTime, setArrivalTime] = useState(application.arrivalTime ?? '')
  const [message, setMessage] = useState(application.message ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  const hasActivity = attendType !== 'no'
  const hasExtra = attendType === 'main' || attendType === 'both'

  useEffect(() => {
    dialogRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      await updateHomecomingApplication(apiClient, application.id, {
        attendType,
        name: name.trim(),
        phone,
        yearStart: hasActivity && yearStart ? yearStart : null,
        yearEnd: hasActivity && yearEnd ? yearEnd : null,
        memberRole: hasActivity && memberRole ? memberRole : null,
        team: hasActivity && memberRole === 'organizer' && team ? team : null,
        isLate: hasExtra && late,
        arrivalTime: hasExtra && late && arrivalTime ? arrivalTime : null,
        message: hasExtra && message.trim() ? message.trim() : null
      })
      onSaved()
    } catch (e) {
      setError(readErrorMessage(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-admin-base/80 px-4 py-6 backdrop-blur-sm">
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="homecoming-edit-title"
        className="max-h-full w-full max-w-[560px] overflow-y-auto rounded-[20px] border border-admin-line-soft bg-admin-card p-6 shadow-admin-lift outline-none"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="homecoming-edit-title"
              className="text-[20px] font-semibold tracking-[-0.025em] text-admin-ink"
            >
              신청 수정
            </h2>
            <p className="mt-1 text-[13px] text-admin-ink-dim">
              신청자가 HR팀원에게 보낸 변경 요청을 반영합니다.
            </p>
          </div>
          <button type="button" onClick={onClose} className={ADMIN_GHOST_BUTTON}>
            닫기
          </button>
        </div>

        {error && (
          <p role="alert" className={ADMIN_ERROR_BANNER}>
            {error}
          </p>
        )}

        <div className="mt-5 grid gap-4">
          <div>
            <label className={LABEL} htmlFor="hc-attend">
              참석 유형
            </label>
            <select
              id="hc-attend"
              className={FIELD}
              value={attendType}
              onChange={(e) => setAttendType(e.target.value as AttendType)}
            >
              {ATTEND_TYPES.map((type) => (
                <option key={type} value={type} className={ADMIN_OPTION}>
                  {ATTEND_LABEL[type]}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL} htmlFor="hc-name">
                이름
              </label>
              <input
                id="hc-name"
                className={FIELD}
                value={name}
                maxLength={50}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className={LABEL} htmlFor="hc-phone">
                전화번호
              </label>
              <input
                id="hc-phone"
                className={FIELD}
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
              />
            </div>
          </div>

          {hasActivity && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LABEL} htmlFor="hc-ys">
                    시작 연도
                  </label>
                  <select
                    id="hc-ys"
                    className={FIELD}
                    value={yearStart}
                    onChange={(e) => setYearStart(Number(e.target.value))}
                  >
                    <option value={0} disabled className={ADMIN_OPTION}>
                      선택
                    </option>
                    {YEARS.map((y) => (
                      <option key={y} value={y} className={ADMIN_OPTION}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL} htmlFor="hc-ye">
                    마지막 연도
                  </label>
                  <select
                    id="hc-ye"
                    className={FIELD}
                    value={yearEnd}
                    onChange={(e) => setYearEnd(Number(e.target.value))}
                  >
                    <option value={0} disabled className={ADMIN_OPTION}>
                      선택
                    </option>
                    {YEARS.map((y) => (
                      <option key={y} value={y} className={ADMIN_OPTION}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LABEL} htmlFor="hc-role">
                    활동 구분
                  </label>
                  <select
                    id="hc-role"
                    className={FIELD}
                    value={memberRole}
                    onChange={(e) => {
                      const next = e.target.value as HomecomingMemberRole
                      setMemberRole(next)
                      if (next !== 'organizer') setTeam('')
                    }}
                  >
                    <option value="" disabled className={ADMIN_OPTION}>
                      선택
                    </option>
                    {(Object.keys(ROLE_LABEL) as HomecomingMemberRole[]).map((r) => (
                      <option key={r} value={r} className={ADMIN_OPTION}>
                        {ROLE_LABEL[r]}
                      </option>
                    ))}
                  </select>
                </div>
                {memberRole === 'organizer' && (
                  <div>
                    <label className={LABEL} htmlFor="hc-team">
                      활동 팀
                    </label>
                    <select
                      id="hc-team"
                      className={FIELD}
                      value={team}
                      onChange={(e) => setTeam(e.target.value as HomecomingTeam)}
                    >
                      <option value="" disabled className={ADMIN_OPTION}>
                        선택
                      </option>
                      {TEAMS.map((t) => (
                        <option key={t} value={t} className={ADMIN_OPTION}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </>
          )}

          {hasExtra && (
            <>
              <div className="grid grid-cols-2 items-end gap-3">
                <label className="flex items-center gap-2.5 py-2.5 text-[14px] text-admin-ink">
                  <input
                    type="checkbox"
                    className="size-5"
                    checked={late}
                    onChange={(e) => {
                      setLate(e.target.checked)
                      if (!e.target.checked) setArrivalTime('')
                    }}
                  />
                  늦게 도착
                </label>
                {late && (
                  <div>
                    <label className={LABEL} htmlFor="hc-arrival">
                      예상 도착 시간
                    </label>
                    <select
                      id="hc-arrival"
                      className={FIELD}
                      value={arrivalTime}
                      onChange={(e) => setArrivalTime(e.target.value)}
                    >
                      <option value="" disabled className={ADMIN_OPTION}>
                        선택
                      </option>
                      {ARRIVAL_TIMES.map((t) => (
                        <option key={t} value={t} className={ADMIN_OPTION}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div>
                <label className={LABEL} htmlFor="hc-msg">
                  문의·요청사항
                </label>
                <textarea
                  id="hc-msg"
                  className={`${FIELD} min-h-[96px]`}
                  value={message}
                  maxLength={1000}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className={ADMIN_GHOST_BUTTON} onClick={onClose}>
            취소
          </button>
          <button
            type="button"
            className={ADMIN_ACCENT_BUTTON}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? '저장 중' : '저장'}
          </button>
        </div>
      </div>
    </div>
  )
}

/** 서버는 하이픈 유무와 관계없이 받지만, 표의 형식(010-0000-0000)에 맞춰 보여준다. */
const formatPhone = (value: string): string => {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length < 4) return d
  if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`
}
