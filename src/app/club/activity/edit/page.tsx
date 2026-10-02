'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { type FormEvent, useEffect, useMemo, useState } from 'react'

import { ClubBackLink } from '@/components/club/ClubUi'
import { ClubSiteHeader } from '@/components/club/ClubSiteHeader'
import {
  DUSK_CANCEL_BUTTON,
  DUSK_CHECKBOX,
  DUSK_INPUT,
  DUSK_SUBMIT_BUTTON,
  DUSK_TEXTAREA,
  DuskField
} from '@/components/ui/dusk/DuskForm'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import {
  ACTIVITY_PHOTO_S3_KEY,
  createActivity,
  fetchActivity,
  fetchActivityRoster,
  updateActivity
} from '@/services/club/activityClient'
import { readClubError } from '@/services/club/clubClient'
import {
  describeUploadError,
  requestPresignedUpload,
  toPublicUrl,
  uploadFileToS3,
  validateUploadSize
} from '@/services/board/uploadClient'
import type { ClubActivityRoster } from '@/types/club'
import { cn } from '@/utils/cn'

/** 서버 `ClubActivitySubmitRequest` 의 사진 최대 개수. */
const MAX_PHOTOS = 10

/** 활동일은 한국 날짜다. */
const todayKst = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' })

/**
 * 활동 기록 작성·수정 (B 담당). 출석 체크와 인증 업로드를 한 화면에서 제출한다.
 *
 * 명단은 서버가 활동일 기준으로 정한다 — 날짜를 바꾸면 명단을 다시 받는다. 제출할 때는 출석한 사람만 보낸다.
 * 인증 완료된 기록은 수정할 수 없다(서버 409).
 */
export default function ClubActivityEditPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const clubId = Number(searchParams.get('clubId') ?? 0)
  const activityId = Number(searchParams.get('id') ?? 0) || null
  const isEdit = activityId !== null
  const { apiClient } = useAuthenticatedApi()

  const [activityDate, setActivityDate] = useState(todayKst)
  // TODO(B): 일정 API(5번)가 나오면 연결 일정을 고르게 한다. 지금은 수정할 때 기존 연결만 유지한다.
  const [scheduleId, setScheduleId] = useState<number | null>(null)
  const [content, setContent] = useState('')
  const [progressNote, setProgressNote] = useState('')
  const [photoUrls, setPhotoUrls] = useState<string[]>([])
  const [revisionReason, setRevisionReason] = useState<string | null>(null)

  const [roster, setRoster] = useState<ClubActivityRoster | null>(null)
  /** 수정 화면이면 저장돼 있던 출석. 명단을 다시 받아도 기본값으로 쓴다. */
  const [savedAttendance, setSavedAttendance] = useState<Record<number, boolean> | null>(null)
  /** 사용자가 직접 바꾼 체크. 활동일을 바꿔도 유지한다. */
  const [overrides, setOverrides] = useState<Record<number, boolean>>({})

  const [loaded, setLoaded] = useState(!isEdit)
  const [blocked, setBlocked] = useState<string | null>(null)
  const [rosterError, setRosterError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // 수정 화면: 저장된 기록으로 채운다.
  useEffect(() => {
    if (!clubId || !activityId) return
    fetchActivity(apiClient, clubId, activityId)
      .then((activity) => {
        if (!activity.editable) {
          setBlocked('인증 완료됐거나 리더가 아니어서 이 기록을 수정할 수 없어요.')
          return
        }
        setActivityDate(activity.activityDate)
        setScheduleId(activity.scheduleId ?? null)
        setContent(activity.content)
        setProgressNote(activity.progressNote ?? '')
        setPhotoUrls(activity.photoUrls)
        setRevisionReason(
          activity.status === 'REVISION_REQUESTED' ? (activity.revisionReason ?? null) : null
        )
        setSavedAttendance(
          Object.fromEntries((activity.attendance ?? []).map((row) => [row.userId, row.attended]))
        )
      })
      .catch((err) => setBlocked(readClubError(err, '기록을 불러오지 못했어요.')))
      .finally(() => setLoaded(true))
  }, [apiClient, clubId, activityId])

  // 활동일이 바뀌면 그날 명단을 다시 받는다.
  useEffect(() => {
    if (!clubId || !loaded || blocked || !activityDate) return
    let cancelled = false
    setRosterError(null)
    fetchActivityRoster(apiClient, clubId, activityDate, scheduleId)
      .then((data) => {
        if (!cancelled) setRoster(data)
      })
      .catch((err) => {
        if (cancelled) return
        setRoster(null)
        setRosterError(readClubError(err, '명단을 불러오지 못했어요.'))
      })
    return () => {
      cancelled = true
    }
  }, [apiClient, clubId, activityDate, scheduleId, loaded, blocked])

  // 기본값: 직접 바꾼 값 → 저장돼 있던 출석 → QR 체크인 여부.
  const attendedIds = useMemo(
    () =>
      (roster?.members ?? [])
        .filter(
          (member) =>
            overrides[member.userId] ?? savedAttendance?.[member.userId] ?? member.checkedIn
        )
        .map((member) => member.userId),
    [roster, overrides, savedAttendance]
  )
  const required = roster?.requiredCount ?? 0
  const satisfied = attendedIds.length >= required

  const uploadPhotos = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const room = MAX_PHOTOS - photoUrls.length
    if (room <= 0) {
      setMessage(`사진은 ${MAX_PHOTOS}장까지 올릴 수 있어요.`)
      return
    }
    setUploading(true)
    setMessage(null)
    try {
      for (const file of Array.from(files).slice(0, room)) {
        const sizeError = validateUploadSize(file)
        if (sizeError) {
          setMessage(sizeError)
          continue
        }
        const { uploadUrl } = await requestPresignedUpload(apiClient, file, ACTIVITY_PHOTO_S3_KEY)
        await uploadFileToS3(uploadUrl, file)
        const url = toPublicUrl(uploadUrl)
        setPhotoUrls((prev) => [...prev, url])
      }
    } catch (err) {
      setMessage(describeUploadError(err))
    } finally {
      setUploading(false)
    }
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!roster) {
      setMessage('명단을 불러온 뒤에 제출할 수 있어요.')
      return
    }
    if (photoUrls.length === 0) {
      setMessage('활동 사진을 1장 이상 올려 주세요.')
      return
    }
    if (!content.trim()) {
      setMessage('활동 내용을 입력해 주세요.')
      return
    }
    setSubmitting(true)
    setMessage(null)
    const payload = {
      activityDate,
      scheduleId,
      photoUrls,
      content: content.trim(),
      attendedUserIds: attendedIds,
      progressNote: progressNote.trim() || null
    }
    try {
      let savedId = activityId
      if (savedId) {
        await updateActivity(apiClient, clubId, savedId, payload)
      } else {
        savedId = await createActivity(apiClient, clubId, payload)
      }
      router.push(`/club/activity/?clubId=${clubId}&id=${savedId}`)
    } catch (err) {
      setMessage(readClubError(err, '제출하지 못했어요. 잠시 후 다시 시도해 주세요.'))
      setSubmitting(false)
    }
  }

  const backHref = activityId
    ? `/club/activity/?clubId=${clubId}&id=${activityId}`
    : `/club/detail/?id=${clubId}`
  const submitLabel = submitting
    ? '제출하는 중…'
    : revisionReason
      ? '수정해서 다시 제출'
      : isEdit
        ? '수정하기'
        : '제출하기'

  return (
    <main className="min-h-screen">
      <ClubSiteHeader />
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-7 px-[clamp(20px,5vw,44px)] pb-[100px] pt-11 mobile:pt-6">
        <div>
          <ClubBackLink href={backHref} label={activityId ? '활동 기록으로' : '소모임으로'} />
          <h1 className="mt-6 text-[clamp(25px,3vw,36px)] font-semibold leading-[1.3] tracking-[-0.03em]">
            {isEdit ? '활동 기록 수정' : '활동 기록 작성'}
          </h1>
          <p className="mt-2.5 text-sm leading-[1.6] text-dusk-ink-700">
            출석과 인증을 한 번에 제출해요. 제출하면 팀 피드와 운영진 검토 목록에 올라가요.
          </p>
        </div>

        {blocked ? (
          <p className="py-16 text-center text-[15px] text-dusk-ink-800">{blocked}</p>
        ) : !loaded ? (
          <p className="py-16 text-center text-[15px] text-dusk-ink-800">불러오는 중…</p>
        ) : (
          <>
            {revisionReason && (
              <div className="flex flex-col gap-1.5 rounded-[14px] border border-[rgba(217,117,106,0.45)] bg-[rgba(217,117,106,0.08)] px-[18px] py-4">
                <div className="text-sm font-semibold text-signal-err">운영진 보완 요청</div>
                <div className="whitespace-pre-line text-sm leading-[1.6] text-dusk-ink-200">
                  {revisionReason}
                </div>
              </div>
            )}

            <form className="flex flex-col gap-6" onSubmit={submit}>
              <DuskField label="활동일" required>
                <input
                  type="date"
                  required
                  value={activityDate}
                  onChange={(event) => setActivityDate(event.target.value)}
                  className={cn(DUSK_INPUT, '[color-scheme:dark]')}
                />
              </DuskField>

              <DuskField
                label="실제 참석자"
                required
                group
                hint="명단은 활동일 기준 팀원이에요. 이후에 합류한 사람은 나오지 않아요."
              >
                {rosterError ? (
                  <p className="text-sm text-signal-err">{rosterError}</p>
                ) : !roster ? (
                  <p className="text-sm text-dusk-ink-800">명단을 불러오는 중…</p>
                ) : (
                  <>
                    <div className="flex justify-end text-[13px]">
                      <span className={satisfied ? 'text-signal-ok' : 'text-tag-event'}>
                        {attendedIds.length} / {roster.members.length}명 · 필요 {required}명{' '}
                        {satisfied ? '충족' : '미달'}
                      </span>
                    </div>
                    {roster.members.length === 0 ? (
                      <p className="text-sm text-dusk-ink-800">이 날짜에는 팀원이 없어요.</p>
                    ) : (
                      <div className="overflow-hidden rounded-[14px] border border-dusk-line">
                        {roster.members.map((member) => (
                          <label
                            key={member.userId}
                            className="flex min-h-12 cursor-pointer items-center gap-3 border-b border-dusk-line-soft px-4 py-3 last:border-b-0"
                          >
                            <input
                              type="checkbox"
                              checked={attendedIds.includes(member.userId)}
                              onChange={(event) =>
                                setOverrides((prev) => ({
                                  ...prev,
                                  [member.userId]: event.target.checked
                                }))
                              }
                              className={DUSK_CHECKBOX}
                            />
                            <span className="text-[15px]">{member.name}</span>
                            {member.checkedIn && (
                              <span className="inline-flex rounded-full bg-[rgba(126,150,200,0.20)] px-2 py-0.5 text-[11px] text-tag-info">
                                QR 체크인
                              </span>
                            )}
                            {member.leader && (
                              <span className="ml-auto text-[13px] text-dusk-ink-800">리더</span>
                            )}
                          </label>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </DuskField>

              <DuskField
                label="활동 사진 (1장 이상)"
                required
                group
                hint="사진은 로그인한 부원 전체에게 공개돼요"
              >
                <div className="grid grid-cols-4 gap-2">
                  {photoUrls.map((url, index) => (
                    <div
                      key={url}
                      className="relative aspect-square overflow-hidden rounded-xl bg-dusk-slot"
                    >
                      {/* next/image 는 못 쓴다 — S3 호스트를 remotePatterns 에 적을 수 없다. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`활동 사진 ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        aria-label={`활동 사진 ${index + 1} 빼기`}
                        onClick={() => setPhotoUrls((prev) => prev.filter((u) => u !== url))}
                        className="absolute right-1 top-1 flex size-7 items-center justify-center rounded-full bg-[rgba(27,22,34,0.8)] text-sm text-dusk-ink-200"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {photoUrls.length < MAX_PHOTOS && (
                    <label
                      aria-label="사진 추가"
                      className={cn(
                        'flex aspect-square cursor-pointer items-center justify-center rounded-xl border border-dashed border-dusk-line-dashed text-2xl text-dusk-ink-700',
                        uploading && 'cursor-wait opacity-60'
                      )}
                    >
                      {uploading ? <span className="text-xs">올리는 중…</span> : '+'}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={uploading}
                        className="sr-only"
                        onChange={(event) => {
                          void uploadPhotos(event.target.files)
                          event.target.value = ''
                        }}
                      />
                    </label>
                  )}
                </div>
              </DuskField>

              <DuskField label="활동 내용" required>
                <textarea
                  rows={4}
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  className={DUSK_TEXTAREA}
                />
              </DuskField>

              <DuskField label="목표 진행 상황 (선택)">
                <input
                  type="text"
                  value={progressNote}
                  onChange={(event) => setProgressNote(event.target.value)}
                  placeholder="예: 6명 중 3명 골드 4 달성"
                  className={DUSK_INPUT}
                />
              </DuskField>

              {message && <p className="text-sm text-signal-err">{message}</p>}

              <div className="sticky bottom-0 flex gap-2.5 bg-dusk-base pb-3 pt-2">
                <a href={backHref} className={DUSK_CANCEL_BUTTON}>
                  취소
                </a>
                <button
                  type="submit"
                  disabled={submitting || uploading || !roster}
                  className={DUSK_SUBMIT_BUTTON}
                >
                  {submitLabel}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </main>
  )
}
