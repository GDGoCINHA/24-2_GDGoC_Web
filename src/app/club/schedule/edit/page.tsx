'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { type FormEvent, useEffect, useState } from 'react'

import { fromKstInputValue, toKstInputValue } from '@/components/club/clubDate'
import { ClubBackLink } from '@/components/club/ClubUi'
import { ClubSiteHeader } from '@/components/club/ClubSiteHeader'
import {
  DUSK_CANCEL_BUTTON,
  DUSK_DANGER_BUTTON,
  DUSK_INPUT,
  DUSK_SUBMIT_BUTTON,
  DUSK_TEXTAREA,
  DuskField
} from '@/components/ui/dusk/DuskForm'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import { readClubError } from '@/services/club/clubClient'
import {
  createSchedule,
  deleteSchedule,
  fetchSchedules,
  updateSchedule
} from '@/services/club/scheduleClient'
import { cn } from '@/utils/cn'

/**
 * 일정 등록·수정 (B 담당, 리더). 일정 등록은 선택이다 — 일정 없이 모인 활동도 기록할 수 있다.
 *
 * 시각은 한국 시간으로 입력받는다.
 */
export default function ClubScheduleEditPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const clubId = Number(searchParams.get('clubId') ?? 0)
  const scheduleId = Number(searchParams.get('id') ?? 0) || null
  const isEdit = scheduleId !== null
  const { apiClient } = useAuthenticatedApi()

  const [title, setTitle] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [location, setLocation] = useState('')
  const [onlineLink, setOnlineLink] = useState('')
  const [description, setDescription] = useState('')
  const [loaded, setLoaded] = useState(!isEdit)
  const [blocked, setBlocked] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  // 일정 하나를 읽는 API 는 없다. 목록에서 찾는다.
  useEffect(() => {
    if (!clubId || !scheduleId) return
    Promise.all([
      fetchSchedules(apiClient, clubId, 'upcoming'),
      fetchSchedules(apiClient, clubId, 'past')
    ])
      .then(([upcoming, past]) => {
        const found = [...upcoming, ...past].find((schedule) => schedule.id === scheduleId)
        if (!found) {
          setBlocked('일정을 찾을 수 없어요.')
          return
        }
        setTitle(found.title)
        setStartsAt(toKstInputValue(found.startsAt))
        setLocation(found.location ?? '')
        setOnlineLink(found.onlineLink ?? '')
        setDescription(found.description ?? '')
      })
      .catch((err) => setBlocked(readClubError(err, '일정을 불러오지 못했어요.')))
      .finally(() => setLoaded(true))
  }, [apiClient, clubId, scheduleId])

  const backHref = `/club/detail/?id=${clubId}`

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!title.trim() || !startsAt) {
      setMessage('회차 제목과 날짜·시간을 입력해 주세요.')
      return
    }
    setBusy(true)
    setMessage(null)
    const payload = {
      title: title.trim(),
      startsAt: fromKstInputValue(startsAt),
      location: location.trim() || null,
      onlineLink: onlineLink.trim() || null,
      description: description.trim() || null
    }
    try {
      if (scheduleId) {
        await updateSchedule(apiClient, clubId, scheduleId, payload)
      } else {
        await createSchedule(apiClient, clubId, payload)
      }
      router.push(backHref)
    } catch (err) {
      setMessage(readClubError(err, '저장하지 못했어요. 잠시 후 다시 시도해 주세요.'))
      setBusy(false)
    }
  }

  const remove = async () => {
    if (!scheduleId) return
    if (!window.confirm('이 일정을 지울까요? 연결된 활동 기록은 남고 연결만 끊겨요.')) return
    setBusy(true)
    try {
      await deleteSchedule(apiClient, clubId, scheduleId)
      router.push(backHref)
    } catch (err) {
      setMessage(readClubError(err, '지우지 못했어요.'))
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen">
      <ClubSiteHeader />
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-7 px-[clamp(20px,5vw,44px)] pb-[100px] pt-11 mobile:pt-6">
        <div>
          <ClubBackLink href={backHref} label="소모임으로" />
          <h1 className="mt-6 text-[clamp(25px,3vw,36px)] font-semibold leading-[1.3] tracking-[-0.03em]">
            {isEdit ? '일정 수정' : '일정 등록'}
          </h1>
          <p className="mt-2.5 text-sm leading-[1.6] text-dusk-ink-700">
            일정을 올리면 멤버가 참석 예정을 응답하고, 모임에서 QR 로 출석할 수 있어요.
          </p>
        </div>

        {blocked ? (
          <p className="py-16 text-center text-[15px] text-dusk-ink-800">{blocked}</p>
        ) : !loaded ? (
          <p className="py-16 text-center text-[15px] text-dusk-ink-800">불러오는 중…</p>
        ) : (
          <form className="flex flex-col gap-6" onSubmit={submit}>
            <DuskField label="회차 제목" required>
              <input
                type="text"
                required
                maxLength={200}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="예: 3주차 — 그래프 탐색"
                className={DUSK_INPUT}
              />
            </DuskField>

            <DuskField label="날짜·시간" required>
              <input
                type="datetime-local"
                required
                value={startsAt}
                onChange={(event) => setStartsAt(event.target.value)}
                className={cn(DUSK_INPUT, '[color-scheme:dark]')}
              />
            </DuskField>

            <div className="grid grid-cols-2 gap-3 mobile:grid-cols-1">
              <DuskField label="장소 (선택)">
                <input
                  type="text"
                  maxLength={200}
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="예: 하이테크 301"
                  className={DUSK_INPUT}
                />
              </DuskField>
              <DuskField label="온라인 링크 (선택)" hint="팀 멤버에게만 보여요">
                <input
                  type="url"
                  maxLength={500}
                  value={onlineLink}
                  onChange={(event) => setOnlineLink(event.target.value)}
                  placeholder="https://"
                  className={DUSK_INPUT}
                />
              </DuskField>
            </div>

            <DuskField label="활동 내용 (선택)">
              <textarea
                rows={3}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className={DUSK_TEXTAREA}
              />
            </DuskField>

            {message && <p className="text-sm text-signal-err">{message}</p>}

            <div className="sticky bottom-0 flex gap-2.5 bg-dusk-base pb-3 pt-2">
              {isEdit ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void remove()}
                  className={DUSK_DANGER_BUTTON}
                >
                  삭제
                </button>
              ) : (
                <a href={backHref} className={DUSK_CANCEL_BUTTON}>
                  취소
                </a>
              )}
              <button type="submit" disabled={busy} className={DUSK_SUBMIT_BUTTON}>
                {busy ? '저장하는 중…' : isEdit ? '수정하기' : '등록하기'}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  )
}
