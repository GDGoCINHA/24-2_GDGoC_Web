'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState, type FormEvent } from 'react'

import { clubBackTarget, isFromManage } from '@/components/club/clubNav'
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
  fetchClubDetail,
  readClubError,
  replaceClub,
  type ClubSavePayload
} from '@/services/club/clubClient'
import { CLUB_CATEGORY_LABEL, type ClubCategory, type ClubStatus } from '@/types/club'
import { cn } from '@/utils/cn'

const CATEGORIES: ClubCategory[] = ['STUDY', 'HOBBY', 'CAREER', 'ETC']
const IMAGE_S3_KEY = 'club'

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
 * 소모임 개설 (A 담당). 개설하면 승인 대기로 생기고 운영진이 승인하면 게시판에 올라간다.
 * `?id=` 가 있으면 수정 화면으로 쓴다 — 리더가 아니면 서버가 403. 반려된 소모임은 저장하면 다시 승인 대기로 간다.
 */
export default function ClubNewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = Number(searchParams.get('id') ?? 0) || null
  // 수정 화면을 관리 화면에서 열었으면 취소·저장 뒤 관리 화면으로 돌아간다.
  const back = editId ? clubBackTarget(editId, isFromManage(searchParams)) : null
  const { apiClient } = useAuthenticatedApi()

  const [status, setStatus] = useState<ClubStatus | null>(null)
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
        .then((club) => {
          setStatus(club.status)
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
        })
        .catch((err) => setMessage(readClubError(err, '소모임을 불러오지 못했어요.')))
    }
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
    // 입력 중에는 친 그대로 둔다 — 칠 때마다 다듬으면 끝에 친 띄어쓰기가 바로 지워진다. 저장할 때만 다듬는다.
    const payload: ClubSavePayload = {
      ...form,
      name: form.name.trim(),
      summary: form.summary.trim(),
      description: blankToNull(form.description ?? ''),
      activityMethod: blankToNull(form.activityMethod ?? ''),
      kakaoLink: blankToNull(form.kakaoLink ?? '')
    }
    setSubmitting(true)
    setMessage(null)
    try {
      if (editId) {
        await replaceClub(apiClient, editId, payload)
        router.push(back?.href ?? `/club/detail/?id=${editId}`)
      } else {
        const id = await createClub(apiClient, payload)
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
        <div>
          <ClubBackLink href={back?.href ?? '/club/'} label={back?.label ?? '목록으로'} />
          <h1 className="mt-6 text-[clamp(25px,3vw,36px)] font-semibold leading-[1.3] tracking-[-0.03em]">
            {editId ? '소모임 정보 수정' : '소모임 개설'}
          </h1>
          {!editId && (
            <p className="mt-2.5 text-sm text-dusk-ink-700">
              운영진이 승인하면 게시판에 올라가고 참여 신청을 받을 수 있어요
            </p>
          )}
          {status === 'REJECTED' && (
            <p className="mt-2.5 text-sm text-dusk-ink-700">
              고쳐서 저장하면 운영진에게 다시 승인을 요청해요
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
              onChange={(e) => set('description', e.target.value)}
              placeholder="어떤 모임인지 자세히 적어 주세요"
              className={DUSK_TEXTAREA}
            />
          </DuskField>

          <DuskField label="활동 방식">
            <textarea
              rows={3}
              value={form.activityMethod ?? ''}
              onChange={(e) => set('activityMethod', e.target.value)}
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
                  onChange={(e) => set('capacity', e.target.value ? Number(e.target.value) : null)}
                  className={DUSK_INPUT}
                />
              </DuskField>
            </div>
            <p className="text-[13px] text-dusk-ink-800">
              활동 기간은 나중에 바꿀 수 있어요. 완주하려면 기간 동안 매주 1회 이상 모이고, 팀원이
              4명 이상이어야 해요.
            </p>
          </div>

          <DuskField label="단톡방 링크" hint="승인된 멤버에게만 보여요">
            <input
              type="url"
              value={form.kakaoLink ?? ''}
              onChange={(e) => set('kakaoLink', e.target.value)}
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

          <div className="sticky bottom-0 flex gap-2.5 bg-gradient-to-t from-[#2C2028] from-70% to-transparent pb-[calc(12px+env(safe-area-inset-bottom))] pt-7">
            <a href={back?.href ?? '/club/'} className={DUSK_CANCEL_BUTTON}>
              취소
            </a>
            <button type="submit" disabled={submitting || uploading} className={DUSK_SUBMIT_BUTTON}>
              {editId ? '저장하기' : '개설 요청하기'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
