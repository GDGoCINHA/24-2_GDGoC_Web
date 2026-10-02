'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState, type FormEvent } from 'react'

import { ClubBackLink } from '@/components/club/ClubUi'
import { ClubSiteHeader } from '@/components/club/ClubSiteHeader'
import {
  DUSK_CANCEL_BUTTON,
  DUSK_CHIP,
  DUSK_CHIP_ACTIVE,
  DUSK_INPUT,
  DUSK_SUBMIT_BUTTON,
  DUSK_TEXTAREA,
  DuskField
} from '@/components/ui/dusk/DuskForm'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import {
  describeUploadError,
  requestPresignedUpload,
  toPublicUrl,
  uploadFileToS3,
  validateUploadSize
} from '@/services/board/uploadClient'
import {
  createClub,
  createOpenRequest,
  fetchClubDetail,
  fetchMyLeaderGrant,
  fetchMyOpenRequests,
  readClubError,
  updateClub,
  type ClubSavePayload
} from '@/services/club/clubClient'
import { CLUB_CATEGORY_LABEL, type ClubCategory, type ClubOpenRequest } from '@/types/club'
import { cn } from '@/utils/cn'

const CATEGORIES: ClubCategory[] = ['STUDY', 'HOBBY', 'CAREER', 'ETC']
const IMAGE_S3_KEY = 'club'

const OPEN_REQUEST_STATUS_LABEL: Record<ClubOpenRequest['status'], string> = {
  PENDING: '검토 중',
  APPROVED: '승인됨',
  REJECTED: '반려'
}

const blankToNull = (value: string) => (value.trim() === '' ? null : value.trim())

function CategoryChips({
  value,
  onChange
}: {
  value: ClubCategory
  onChange: (value: ClubCategory) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
          className={cn(value === item ? DUSK_CHIP_ACTIVE : DUSK_CHIP, 'px-[18px] py-2.5 text-sm')}
        >
          {CLUB_CATEGORY_LABEL[item]}
        </button>
      ))}
    </div>
  )
}

/**
 * 리더 권한이 없을 때 보이는 개설 신청서. 운영진이 승인하면 권한이 생기고, 그때 이 화면에서 바로
 * 개설할 수 있다.
 */
function OpenRequestForm() {
  const { apiClient } = useAuthenticatedApi()
  const [requests, setRequests] = useState<ClubOpenRequest[]>([])
  const [name, setName] = useState('')
  const [category, setCategory] = useState<ClubCategory>('STUDY')
  const [summary, setSummary] = useState('')
  const [goal, setGoal] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const load = () => {
    fetchMyOpenRequests(apiClient)
      .then(setRequests)
      .catch(() => setRequests([]))
  }
  useEffect(load, [apiClient])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim() || !summary.trim()) {
      setMessage('이름과 한 줄 소개를 입력해 주세요.')
      return
    }
    setSubmitting(true)
    try {
      await createOpenRequest(apiClient, {
        name: name.trim(),
        category,
        summary: summary.trim(),
        goal: blankToNull(goal)
      })
      setName('')
      setSummary('')
      setGoal('')
      setMessage('신청했어요. 운영진이 승인하면 이 화면에서 바로 개설할 수 있어요.')
      load()
    } catch (err) {
      setMessage(readClubError(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div>
        <ClubBackLink href="/club/" label="목록으로" />
        <h1 className="mt-6 text-[clamp(25px,3vw,36px)] font-semibold leading-[1.3] tracking-[-0.03em]">
          소모임 개설 신청
        </h1>
        <p className="mt-2.5 text-sm text-dusk-ink-700">
          리더 권한이 있어야 소모임을 열 수 있어요. 운영진이 승인하면 권한이 생겨요.
        </p>
      </div>

      {requests.length > 0 && (
        <ul className="flex flex-col gap-2">
          {requests.map((request) => (
            <li
              key={request.id}
              className="flex flex-wrap items-center gap-2 rounded-[14px] border border-dusk-line px-4 py-3 text-sm"
            >
              <span className="font-semibold">{request.name}</span>
              <span className="text-dusk-ink-800">{CLUB_CATEGORY_LABEL[request.category]}</span>
              <span
                className={cn(
                  'ml-auto',
                  request.status === 'APPROVED' ? 'text-ember' : 'text-dusk-ink-700'
                )}
              >
                {OPEN_REQUEST_STATUS_LABEL[request.status]}
              </span>
              {request.rejectReason && (
                <p className="w-full text-[13px] text-dusk-ink-800">{request.rejectReason}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      <form className="flex flex-col gap-6" onSubmit={submit}>
        <DuskField label="소모임 이름" required>
          <input
            type="text"
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={DUSK_INPUT}
          />
        </DuskField>
        <DuskField label="분야" required group>
          <CategoryChips value={category} onChange={setCategory} />
        </DuskField>
        <DuskField label="한 줄 소개" required>
          <input
            type="text"
            maxLength={200}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className={DUSK_INPUT}
          />
        </DuskField>
        <DuskField label="목표">
          <textarea
            rows={3}
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="이 소모임으로 이루고 싶은 것"
            className={DUSK_TEXTAREA}
          />
        </DuskField>
        {message && <p className="text-sm text-dusk-ink-400">{message}</p>}
        <div className="sticky bottom-0 flex gap-2.5 bg-dusk-base pb-3 pt-2">
          <a href="/club/" className={DUSK_CANCEL_BUTTON}>
            취소
          </a>
          <button type="submit" disabled={submitting} className={DUSK_SUBMIT_BUTTON}>
            신청하기
          </button>
        </div>
      </form>
    </>
  )
}

/** 소모임 개설 (A 담당). `?id=` 가 있으면 수정 화면으로 쓴다 — 리더가 아니면 서버가 403. */
export default function ClubNewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = Number(searchParams.get('id') ?? 0) || null
  const { apiClient } = useAuthenticatedApi()

  const [hasGrant, setHasGrant] = useState<boolean | null>(editId ? true : null)
  const [form, setForm] = useState<ClubSavePayload>({
    name: '',
    category: 'STUDY',
    summary: '',
    description: null,
    activityMethod: null,
    imageUrl: null,
    kakaoLink: null,
    capacity: null,
    startDate: null,
    endDate: null
  })
  const [message, setMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editId) {
      fetchClubDetail(apiClient, editId)
        .then((club) =>
          setForm({
            name: club.name,
            category: club.category,
            summary: club.summary,
            description: club.description,
            activityMethod: club.activityMethod,
            imageUrl: club.imageUrl,
            kakaoLink: club.kakaoLink,
            capacity: club.capacity,
            startDate: club.startDate,
            endDate: club.endDate
          })
        )
        .catch((err) => setMessage(readClubError(err, '소모임을 불러오지 못했어요.')))
      return
    }
    fetchMyLeaderGrant(apiClient)
      .then(setHasGrant)
      .catch(() => setHasGrant(false))
  }, [apiClient, editId])

  const set = <K extends keyof ClubSavePayload>(key: K, value: ClubSavePayload[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const upload = async (file: File) => {
    const sizeError = validateUploadSize(file)
    if (sizeError) {
      setMessage(sizeError)
      return
    }
    setUploading(true)
    try {
      const { uploadUrl } = await requestPresignedUpload(apiClient, file, IMAGE_S3_KEY)
      await uploadFileToS3(uploadUrl, file)
      set('imageUrl', toPublicUrl(uploadUrl))
    } catch (err) {
      setMessage(describeUploadError(err))
    } finally {
      setUploading(false)
    }
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!form.name.trim() || !form.summary.trim()) {
      setMessage('이름과 한 줄 소개를 입력해 주세요.')
      return
    }
    setSubmitting(true)
    setMessage(null)
    try {
      if (editId) {
        await updateClub(apiClient, editId, form)
        router.push(`/club/detail/?id=${editId}`)
      } else {
        const id = await createClub(apiClient, form)
        router.push(`/club/detail/?id=${id}`)
      }
    } catch (err) {
      setMessage(readClubError(err))
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen">
      <ClubSiteHeader />
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-8 px-[clamp(20px,5vw,44px)] pb-[100px] pt-11 mobile:pt-6">
        {hasGrant === null && (
          <p className="py-16 text-center text-[15px] text-dusk-ink-800">불러오는 중…</p>
        )}
        {hasGrant === false && <OpenRequestForm />}
        {hasGrant && (
          <>
            <div>
              <ClubBackLink
                href={editId ? `/club/detail/?id=${editId}` : '/club/'}
                label={editId ? '소모임으로' : '목록으로'}
              />
              <h1 className="mt-6 text-[clamp(25px,3vw,36px)] font-semibold leading-[1.3] tracking-[-0.03em]">
                {editId ? '소모임 정보 수정' : '소모임 개설'}
              </h1>
              {!editId && (
                <p className="mt-2.5 text-sm text-dusk-ink-700">
                  개설하면 바로 게시판에 올라가고 참여 신청을 받을 수 있어요
                </p>
              )}
            </div>

            <form className="flex flex-col gap-6" onSubmit={submit}>
              <DuskField label="소모임 이름" required>
                <input
                  type="text"
                  maxLength={100}
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  className={DUSK_INPUT}
                />
              </DuskField>

              <DuskField label="분야" required group>
                <CategoryChips value={form.category} onChange={(value) => set('category', value)} />
              </DuskField>

              <DuskField label="한 줄 소개" required>
                <input
                  type="text"
                  maxLength={200}
                  value={form.summary}
                  onChange={(e) => set('summary', e.target.value)}
                  className={DUSK_INPUT}
                />
              </DuskField>

              <DuskField label="소개">
                <textarea
                  rows={4}
                  value={form.description ?? ''}
                  onChange={(e) => set('description', blankToNull(e.target.value))}
                  placeholder="어떤 모임인지 자세히 적어 주세요"
                  className={DUSK_TEXTAREA}
                />
              </DuskField>

              <DuskField label="활동 방식">
                <textarea
                  rows={3}
                  value={form.activityMethod ?? ''}
                  onChange={(e) => set('activityMethod', blankToNull(e.target.value))}
                  placeholder="예: 매주 화요일 저녁 오프라인, 주제별 문제 4개 풀이 발표"
                  className={DUSK_TEXTAREA}
                />
              </DuskField>

              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-3 gap-3 mobile:grid-cols-1">
                  <DuskField label="활동 시작일">
                    <input
                      type="date"
                      value={form.startDate ?? ''}
                      onChange={(e) => set('startDate', e.target.value || null)}
                      className={cn(DUSK_INPUT, '[color-scheme:dark]')}
                    />
                  </DuskField>
                  <DuskField label="활동 종료일">
                    <input
                      type="date"
                      value={form.endDate ?? ''}
                      onChange={(e) => set('endDate', e.target.value || null)}
                      className={cn(DUSK_INPUT, '[color-scheme:dark]')}
                    />
                  </DuskField>
                  <DuskField label="정원 (리더 포함)">
                    <input
                      type="number"
                      min={1}
                      value={form.capacity ?? ''}
                      onChange={(e) =>
                        set('capacity', e.target.value ? Number(e.target.value) : null)
                      }
                      className={DUSK_INPUT}
                    />
                  </DuskField>
                </div>
                <p className="text-[13px] text-dusk-ink-800">
                  활동 기간은 나중에 바꿀 수 있어요. 완주하려면 기간 동안 매주 1회 이상 모이고,
                  팀원이 4명 이상이어야 해요.
                </p>
              </div>

              <DuskField label="단톡방 링크" hint="승인된 멤버에게만 보여요">
                <input
                  type="url"
                  value={form.kakaoLink ?? ''}
                  onChange={(e) => set('kakaoLink', blankToNull(e.target.value))}
                  placeholder="https://open.kakao.com/..."
                  className={DUSK_INPUT}
                />
              </DuskField>

              <DuskField label="대표 이미지" group>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) void upload(file)
                    e.target.value = ''
                  }}
                />
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                  style={form.imageUrl ? { backgroundImage: `url(${form.imageUrl})` } : undefined}
                  className="h-40 rounded-[14px] border border-dashed border-dusk-line-dashed bg-cover bg-center text-sm text-dusk-ink-700 mobile:h-32"
                >
                  {uploading ? '올리는 중…' : form.imageUrl ? '' : '눌러서 이미지 올리기'}
                </button>
              </DuskField>

              {message && <p className="text-sm text-signal-err">{message}</p>}

              <div className="sticky bottom-0 flex gap-2.5 bg-dusk-base pb-3 pt-2">
                <a
                  href={editId ? `/club/detail/?id=${editId}` : '/club/'}
                  className={DUSK_CANCEL_BUTTON}
                >
                  취소
                </a>
                <button
                  type="submit"
                  disabled={submitting || uploading}
                  className={DUSK_SUBMIT_BUTTON}
                >
                  {editId ? '저장하기' : '개설하기'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </main>
  )
}
