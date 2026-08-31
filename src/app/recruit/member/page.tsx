'use client'

import React, { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import axios, { type AxiosInstance } from 'axios'

import RecruitMemberGate from '@/components/recruit/RecruitMemberGate'
import {
  RECRUIT_STEP_COUNT,
  RecruitStepIndicator,
  RecruitStepNav
} from '@/components/recruit/RecruitFormSteps'
import { RecruitNotice } from '@/components/recruit/RecruitNotice'
import Loader from '@/components/ui/common/Loader'
import { PrivacyPolicyNotice } from '@/components/ui/common/PrivacyPolicyNotice'
import {
  DuskField,
  DUSK_CHECKBOX,
  DUSK_CHIP,
  DUSK_CHIP_ACTIVE,
  DUSK_INPUT,
  DUSK_INPUT_READONLY,
  DUSK_OPTION,
  DUSK_SELECT,
  DUSK_TEXTAREA
} from '@/components/ui/dusk/DuskForm'
import { interestOptions } from '@/constant/interestOptions'
import { formatMajorLabel } from '@/constant/majorOptions'
import { formatKoreanPeriodShort, resolveMemberSchedule } from '@/constant/recruitSchedule'
import { wishOptions } from '@/constant/wishOptions'
import { useAuth } from '@/hooks/useAuth'
import { useRecruitMemberPeriod } from '@/hooks/useRecruitMemberPeriod'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import { fetchMyMemberApplication, fetchMyProfile } from '@/services/profile/profileClient'
import type { MyMemberApplication, UserProfile } from '@/types/profile'
import { cn } from '@/utils/cn'
import { formatDateInput } from '@/utils/date'
import { formatPhoneNumberDisplay } from '@/utils/phoneNumber'

/** 이 페이지로 돌아오는 로그인 링크. `trailingSlash: true` 라 끝의 `/` 가 필요하다. */
const LOGIN_HREF = `/login?next=${encodeURIComponent('/recruit/member/')}`

/**
 * 지원서에 실리는 신원. 폼이 아니라 계정에서 온다.
 *
 * 서버도 로그인 계정의 값으로 덮어쓰므로 여기 보이는 것이 실제로 저장되는 값이다.
 */
type Identity = {
  name: string
  studentId: string
  email: string
  phoneNumber: string
  major: string
}

type RecruitFormState = {
  gender: string
  birth: string
  enrolledClassification: string
  gdgInterest: string[]
  gdgWish: string[]
  gdgFeedback: string
  privacyAgreed: boolean
  proofFile: File | null
}

type RecruitFormErrorKey =
  | 'gender'
  | 'birth'
  | 'enrolledClassification'
  | 'proofFile'
  | 'gdgInterest'
  | 'gdgWish'
  | 'privacyAgreed'

type RecruitFormErrors = Partial<Record<RecruitFormErrorKey, string>>

type PresignedUploadResponse = {
  key?: string
  uploadUrl?: string
}

const initialFormState: RecruitFormState = {
  gender: '',
  birth: '',
  enrolledClassification: '',
  gdgInterest: [],
  gdgWish: [],
  gdgFeedback: '',
  privacyAgreed: false,
  proofFile: null
}

const enrollmentOptions = ['재학', '부분등록', '휴학', '군휴학', '수료', '졸업']
const genderOptions = [
  { id: '남성', label: '남성' },
  { id: '여성', label: '여성' },
  { id: '비공개', label: '비공개' }
]

/**
 * 어느 칸이 어느 단계에 속하는지.
 *
 * "다음" 을 누를 때 이 단계의 칸만 본다. 전체를 보면 아직 열지도 않은 뒷 단계가
 * 걸려 첫 단계에서 진행이 막힌다. 일정 안내(2)는 읽기만 하므로 비어 있다.
 */
const RECRUIT_STEP_ERROR_KEYS: RecruitFormErrorKey[][] = [
  ['gender', 'birth', 'enrolledClassification', 'proofFile'],
  ['gdgInterest', 'gdgWish'],
  [],
  ['privacyAgreed']
]

const recruitFormErrorOrder: RecruitFormErrorKey[] = [
  'gender',
  'birth',
  'enrolledClassification',
  'proofFile',
  'gdgInterest',
  'gdgWish',
  'privacyAgreed'
]

const isValidBirthDate = (value: string) => {
  const matched = /^(\d{4})\.(\d{2})\.(\d{2})$/.exec(value.trim())
  if (!matched) return false

  const year = Number(matched[1])
  const month = Number(matched[2])
  const day = Number(matched[3])
  const parsed = new Date(year, month - 1, day)

  return (
    parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day
  )
}

const validateRecruitForm = (formData: RecruitFormState): RecruitFormErrors => {
  const errors: RecruitFormErrors = {}

  if (!formData.gender.trim()) {
    errors.gender = '성별을 선택해 주세요.'
  }

  if (!formData.birth.trim()) {
    errors.birth = '생년월일을 입력해 주세요.'
  } else if (!isValidBirthDate(formData.birth)) {
    errors.birth = '생년월일을 YYYY.MM.DD 형식으로 입력해 주세요.'
  }

  if (!formData.enrolledClassification.trim()) {
    errors.enrolledClassification = '재학 상태를 선택해 주세요.'
  }

  if (formData.enrolledClassification === '군휴학' && !formData.proofFile) {
    errors.proofFile = '군휴학은 증빙 서류를 첨부해 주세요.'
  }

  if (formData.gdgInterest.length === 0) {
    errors.gdgInterest = '관심 분야를 1개 이상 선택해 주세요.'
  }

  if (formData.gdgWish.length === 0) {
    errors.gdgWish = '하고 싶은 활동을 1개 이상 선택해 주세요.'
  }

  if (!formData.privacyAgreed) {
    errors.privacyAgreed = '개인정보 수집 및 이용에 동의해 주세요.'
  }

  return errors
}

/** `?preview=1` 용 가짜 계정. 오픈 전에 로그인 없이 폼 모양만 볼 때 쓴다. */
const PREVIEW_IDENTITY: Identity = {
  name: '홍길동',
  studentId: '12200000',
  email: 'hong@inha.edu',
  phoneNumber: '01000000000',
  major: 'CSE'
}

/** 'Y26_2' → '2026-2학기' */
const formatSemesterLabel = (value?: string | null) => {
  if (!value) return '-'
  const matched = /^Y(\d{2})_(\d)$/.exec(value)
  return matched ? `20${matched[1]}-${matched[2]}학기` : value
}

const formatDateTime = (value?: string | null) => {
  if (!value) return '-'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * 고칠 수 없는 값이지만 **읽히기는 해야 한다.** DUSK_INPUT_READONLY 의 글자색은
 * placeholder 와 같은 밝기라, 칸이 전부 읽기 전용인 여기서는 빈 폼처럼 보인다.
 * 테두리·배경만 흐리게 두고 값은 입력칸과 같은 밝기로 올린다.
 */
function IdentityRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[13px] text-dusk-ink-700">{label}</span>
      <p className={cn(DUSK_INPUT_READONLY, 'text-dusk-ink-100')}>{value}</p>
    </div>
  )
}

/**
 * 계정에서 가져온 신원을 읽기 전용으로 보여준다.
 *
 * 입력칸으로 두면 여기서 고친 값이 저장될 것처럼 보이는데 실제로는 서버가 계정 값으로 덮어쓴다.
 * 무엇이 제출되는지는 보여주되 고치는 자리는 프로필로 넘긴다.
 */
function IdentitySection({ identity }: { identity: Identity }) {
  return (
    <section className="flex flex-col gap-[18px] rounded-[14px] border border-[rgba(240,234,228,0.12)] px-5 py-[22px]">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-[15px] font-medium text-dusk-ink-200">지원자 정보</h2>
        <p className="text-[13px] leading-[1.7] text-dusk-ink-700">
          로그인한 계정에서 가져온 값이며 이대로 제출됩니다. 이름·전화번호·주전공이 다르다면{' '}
          <Link href="/profile/" className="text-ember underline underline-offset-2">
            프로필
          </Link>
          에서 먼저 수정해 주세요.
        </p>
      </div>

      <div className="grid gap-[18px] [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
        <IdentityRow label="이름" value={identity.name} />
        <IdentityRow label="학번" value={identity.studentId} />
        <IdentityRow label="전화번호" value={formatPhoneNumberDisplay(identity.phoneNumber)} />
        <IdentityRow label="이메일" value={identity.email} />
      </div>
      <IdentityRow label="주전공" value={formatMajorLabel(identity.major)} />
    </section>
  )
}

function RecruitMemberForm({
  identity,
  apiClient,
  preview,
  onAlreadyApplied
}: {
  identity: Identity
  /** 미리보기에서는 제출하지 않으므로 없다. */
  apiClient: AxiosInstance | null
  preview: boolean
  onAlreadyApplied: () => void
}) {
  const router = useRouter()
  const [formData, setFormData] = useState<RecruitFormState>(initialFormState)
  const [loading, setLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) setFormData((prev) => ({ ...prev, proofFile: file }))
  }

  const handleFileRemove = () => {
    setFormData((prev) => ({ ...prev, proofFile: null }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleValueChange = (field: keyof RecruitFormState) => (value: string) => {
    const nextValue = field === 'birth' ? formatDateInput(value) : value
    setFormData((prev) => ({ ...prev, [field]: nextValue }))
  }

  /** 최대 3개까지 고른다. 넘치면 담지 않고 알린다 — 조용히 무시하면 왜 안 되는지 알 수 없다. */
  const toggleChoice = (field: 'gdgInterest' | 'gdgWish', label: string, value: string) => {
    const current = formData[field]
    if (current.includes(value)) {
      setFormData((prev) => ({ ...prev, [field]: prev[field].filter((item) => item !== value) }))
      return
    }
    if (current.length >= 3) {
      alert(`${label}는 최대 3개까지 선택할 수 있습니다.`)
      return
    }
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], value] }))
  }

  const formErrors = useMemo(() => validateRecruitForm(formData), [formData])
  const isFormValid = Object.keys(formErrors).length === 0

  const [step, setStep] = useState(0)
  /** 여기까지는 가 봤다. 인디케이터에서 되돌아갈 수 있는 범위를 정한다. */
  const [maxReachedStep, setMaxReachedStep] = useState(0)
  /** "다음" 을 눌러 본 단계. 그 전에는 아직 손대지 않은 칸을 붉게 칠하지 않는다. */
  const [attemptedSteps, setAttemptedSteps] = useState<number[]>([])

  const { period: memberPeriod } = useRecruitMemberPeriod()
  const memberSchedule = resolveMemberSchedule(memberPeriod?.notice)
  const intensivePeriodText = formatKoreanPeriodShort(
    memberSchedule.intensiveOpenAt,
    memberSchedule.intensiveCloseAt
  )

  const showStepErrors = isSubmitted || attemptedSteps.includes(step)
  const submittedErrors: RecruitFormErrors = showStepErrors ? formErrors : {}
  // 요약도 지금 단계의 것만 모은다. 화면에 없는 칸을 짚어 봐야 찾아갈 수 없다.
  const submittedErrorMessages = recruitFormErrorOrder
    .filter((key) => RECRUIT_STEP_ERROR_KEYS[step].includes(key))
    .map((key) => submittedErrors[key])
    .filter((message): message is string => Boolean(message))

  const stepHasError = useCallback(
    (index: number) => RECRUIT_STEP_ERROR_KEYS[index].some((key) => Boolean(formErrors[key])),
    [formErrors]
  )

  const markAttempted = useCallback((index: number) => {
    setAttemptedSteps((prev) => (prev.includes(index) ? prev : [...prev, index]))
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  const goNext = () => {
    markAttempted(step)
    if (stepHasError(step)) return
    const next = Math.min(step + 1, RECRUIT_STEP_COUNT - 1)
    setStep(next)
    setMaxReachedStep((reached) => Math.max(reached, next))
    scrollToTop()
  }

  const goPrev = () => {
    setStep((current) => Math.max(current - 1, 0))
    scrollToTop()
  }

  const goTo = (index: number) => {
    if (index > maxReachedStep) return
    setStep(index)
    scrollToTop()
  }

  const uploadProofFile = async (client: AxiosInstance, file: File) => {
    const presignedResponse = await client.post(
      '/recruit/member/apply/proof-file/presigned-upload',
      {
        fileName: file.name,
        contentType: file.type || 'application/octet-stream',
        fileSize: file.size
      }
    )

    const payload = unwrapPresignedUploadResponse(presignedResponse.data)
    if (!payload?.key || !payload.uploadUrl) {
      throw new Error('증빙 파일 업로드 URL 발급 응답이 올바르지 않습니다.')
    }

    // presigned URL 은 S3 로 바로 나간다. 여기에 Authorization 을 실으면 서명이 깨진다.
    const uploadResponse = await fetch(payload.uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type || 'application/octet-stream'
      },
      body: file
    })

    if (!uploadResponse.ok) {
      throw new Error('증빙 파일 S3 업로드에 실패했습니다.')
    }

    return payload.key
  }

  const unwrapPresignedUploadResponse = (raw: unknown): PresignedUploadResponse | null => {
    if (!raw || typeof raw !== 'object') return null

    const record = raw as Record<string, unknown>
    if ('data' in record && record.data && typeof record.data === 'object') {
      return unwrapPresignedUploadResponse(record.data)
    }

    return {
      key: typeof record.key === 'string' ? record.key : undefined,
      uploadUrl: typeof record.uploadUrl === 'string' ? record.uploadUrl : undefined
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitted(true)
    setGlobalError(null)
    if (!isFormValid) {
      // 빠진 칸이 앞 단계에 있으면 그 단계로 되돌린다. 마지막 화면에 없는 항목을
      // 붉게 칠해 봐야 보이지 않아, 누르면 아무 일도 안 일어나는 것처럼 보인다.
      const firstBadStep = RECRUIT_STEP_ERROR_KEYS.findIndex((keys) =>
        keys.some((key) => Boolean(formErrors[key]))
      )
      if (firstBadStep >= 0 && firstBadStep !== step) {
        markAttempted(firstBadStep)
        setStep(firstBadStep)
        scrollToTop()
      }
      return
    }
    if (preview || !apiClient) return
    try {
      setLoading(true)
      // 이름·학번·전화번호·이메일·주전공은 보내지 않는다. 서버가 계정 값으로 채운다.
      const payload: Record<string, unknown> = {
        2: { enrolledClassification: formData.enrolledClassification },
        4: { gender: formData.gender, birth: formData.birth },
        // 회비 입금 여부는 여기서 보내지 않는다. 전에는 개인정보 동의 체크가 그 필드에
        // 실려 나갔다 — 동의가 곧 입금으로 읽히는 모양이었다. 서버가
        // RecruitMemberRequest.toEntity() 에서 false 로 못 박고 있어 실제로 입금 처리된
        // 지원자는 없었지만, 입금 표시는 내역을 보고 운영진이 따로 누른다.
        6: {
          gdgInterest: formData.gdgInterest,
          gdgWish: formData.gdgWish,
          gdgFeedback: formData.gdgFeedback
        }
      }
      if (formData.enrolledClassification === '군휴학' && formData.proofFile) {
        const proofFileKey = await uploadProofFile(apiClient, formData.proofFile)
        const step6 = payload[6] as Record<string, unknown>
        payload[6] = {
          ...step6,
          proofFileUrl: proofFileKey
        }
      }
      await apiClient.post('/recruit/member/apply', payload)
      router.push('/recruit/member/completed?from=recruit')
    } catch (error: unknown) {
      // 화면에서 미리 걸렀어도 다른 탭에서 먼저 냈을 수 있다. 오류 대신 지원 완료 화면으로 넘긴다.
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        onAlreadyApplied()
        return
      }
      const message = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string } | undefined)?.message
        : undefined
      setGlobalError(message || '지원서 제출 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Loader isLoading={loading} />
      <main className="mx-auto w-full max-w-[760px] px-[clamp(20px,5vw,44px)] pb-[100px] pt-14">
        <Link
          href="/recruit/"
          className="text-[13px] text-dusk-ink-800 transition-colors hover:text-dusk-ink-100"
        >
          ← 지원 종류 선택
        </Link>
        <h1 className="mt-6 text-[clamp(24px,2.8vw,34px)] font-semibold leading-[1.26] tracking-[-0.03em]">
          부원 지원서
        </h1>
        <p className="mt-3 text-[15px] text-dusk-ink-600">GDGoC INHA 2026-2 신입 멤버 모집</p>

        <RecruitStepIndicator current={step} maxReached={maxReachedStep} onJump={goTo} />

        <form onSubmit={handleSubmit} className="mt-[38px] flex flex-col gap-[22px]">
          {step === 0 ? (
            <>
              <IdentitySection identity={identity} />

              <div className="grid gap-[18px] [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
                <DuskField label="성별" required error={submittedErrors.gender}>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleValueChange('gender')(e.target.value)}
                    className={DUSK_SELECT}
                    aria-invalid={Boolean(submittedErrors.gender)}
                  >
                    <option value="" className={DUSK_OPTION}>
                      성별을 선택해 주세요.
                    </option>
                    {genderOptions.map((option) => (
                      <option key={option.id} value={option.id} className={DUSK_OPTION}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </DuskField>
                <DuskField label="생년월일" required error={submittedErrors.birth}>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.birth}
                    onChange={(e) => handleValueChange('birth')(e.target.value)}
                    placeholder="생년월일을 입력해 주세요. (YYYY.MM.DD)"
                    className={DUSK_INPUT}
                    aria-invalid={Boolean(submittedErrors.birth)}
                  />
                </DuskField>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-[13px] text-dusk-ink-700">
                  재학 상태<span className="text-signal-err"> *</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {enrollmentOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleValueChange('enrolledClassification')(option)}
                      className={
                        formData.enrolledClassification === option ? DUSK_CHIP_ACTIVE : DUSK_CHIP
                      }
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {submittedErrors.enrolledClassification ? (
                  <span className="text-[13px] text-signal-err">
                    {submittedErrors.enrolledClassification}
                  </span>
                ) : null}
              </div>

              {/* 군휴학은 회비 면제 대상이라 증빙을 받는다. 다른 상태에서는 칸 자체가 없다. */}
              {formData.enrolledClassification === '군휴학' && (
                <DuskField
                  label="증빙 서류 (군 휴학)"
                  required
                  hint="포털에서 군휴학 신청내역 캡쳐"
                  error={submittedErrors.proofFile}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                  />
                  {!formData.proofFile ? (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full rounded-xl border border-[rgba(240,234,228,0.22)] px-6 py-[15px] text-[15px] text-dusk-ink-100 transition-colors hover:border-[rgba(208,129,85,0.6)] hover:bg-[rgba(208,129,85,0.06)]"
                    >
                      + 파일 선택
                    </button>
                  ) : (
                    <div className="flex items-center gap-3 rounded-[10px] bg-[rgba(240,234,228,0.06)] px-4 py-[9px] text-[15px] text-dusk-ink-100">
                      <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                        {formData.proofFile.name}
                      </span>
                      <span className="shrink-0 text-sm text-dusk-ink-800">
                        {(formData.proofFile.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                      <button
                        type="button"
                        onClick={handleFileRemove}
                        className="shrink-0 text-sm text-dusk-ink-800 transition-colors hover:text-signal-err"
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </DuskField>
              )}
            </>
          ) : null}

          {step === 1 ? (
            <>
              <div className="flex flex-col gap-3">
                <span className="text-[13px] text-dusk-ink-700">
                  관심 분야<span className="text-signal-err"> *</span>{' '}
                  <span className="text-dusk-ink-800">최대 3개</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {interestOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleChoice('gdgInterest', '관심 분야', option)}
                      className={
                        formData.gdgInterest.includes(option) ? DUSK_CHIP_ACTIVE : DUSK_CHIP
                      }
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {submittedErrors.gdgInterest ? (
                  <span className="text-[13px] text-signal-err">{submittedErrors.gdgInterest}</span>
                ) : null}
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-[13px] text-dusk-ink-700">
                  하고 싶은 활동<span className="text-signal-err"> *</span>{' '}
                  <span className="text-dusk-ink-800">최대 3개</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {wishOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleChoice('gdgWish', '하고 싶은 활동', option)}
                      className={formData.gdgWish.includes(option) ? DUSK_CHIP_ACTIVE : DUSK_CHIP}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {submittedErrors.gdgWish ? (
                  <span className="text-[13px] text-signal-err">{submittedErrors.gdgWish}</span>
                ) : null}
              </div>

              <DuskField
                label="동아리 운영에 바라는 점"
                hint={`${formData.gdgFeedback.length} / 100`}
              >
                <textarea
                  rows={5}
                  value={formData.gdgFeedback}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, gdgFeedback: e.target.value.slice(0, 100) }))
                  }
                  maxLength={100}
                  placeholder="내용을 입력해 주세요."
                  className={DUSK_TEXTAREA}
                />
              </DuskField>
            </>
          ) : null}

          {step === 2 ? (
            <section className="flex flex-col gap-4 rounded-[14px] border border-[rgba(240,234,228,0.12)] px-5 py-[22px]">
              <h2 className="text-[15px] font-medium text-dusk-ink-200">모집 일정</h2>
              <div className="flex flex-col">
                <div className="flex flex-wrap justify-between gap-4 border-t border-[rgba(240,234,228,0.10)] py-3.5">
                  <span className="text-sm text-dusk-ink-700">집중 모집</span>
                  <span className="text-[15px]">{intensivePeriodText}</span>
                </div>
                <div className="flex flex-wrap justify-between gap-4 border-t border-[rgba(240,234,228,0.10)] py-3.5">
                  <span className="text-sm text-dusk-ink-700">이후</span>
                  <span className="text-[15px]">상시 모집</span>
                </div>
              </div>
              <p className="break-keep text-[13px] leading-[1.8] text-dusk-ink-800">
                부원은 별도 면접 없이 지원서로 합류합니다. 집중 모집 기간이 지난 뒤에도 상시
                모집으로 지원할 수 있어요.
              </p>
            </section>
          ) : null}

          {step === 3 ? (
            <>
              <PrivacyPolicyNotice target="member" showTitle={false} compact />

              <label className="flex cursor-pointer items-start gap-2.5 rounded-[14px] border border-[rgba(240,234,228,0.12)] px-[18px] py-4">
                <input
                  type="checkbox"
                  checked={formData.privacyAgreed}
                  onChange={(e) => setFormData((p) => ({ ...p, privacyAgreed: e.target.checked }))}
                  className={cn(DUSK_CHECKBOX, 'mt-[3px]')}
                  aria-invalid={Boolean(submittedErrors.privacyAgreed)}
                />
                <span className="text-[15px] leading-[1.7] text-dusk-ink-400">
                  개인정보 수집 및 이용, 개인정보 처리방침에 동의합니다.
                  <span className="text-signal-err"> *</span>
                </span>
              </label>
            </>
          ) : null}

          {globalError ? (
            <p className="text-[13px] leading-[1.7] text-signal-err">{globalError}</p>
          ) : null}

          {submittedErrorMessages.length > 0 ? (
            <div
              role="alert"
              className="rounded-[14px] border border-[rgba(196,88,74,0.45)] bg-[rgba(196,88,74,0.10)] px-4 py-3"
            >
              <p className="text-[13px] font-medium text-signal-err">필수 항목을 확인해 주세요.</p>
              <ul className="mt-2 flex flex-col gap-1 text-[13px] leading-[1.7] text-signal-err">
                {submittedErrorMessages.map((message) => (
                  <li key={message}>- {message}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <RecruitStepNav
            step={step}
            loading={loading}
            onPrev={goPrev}
            onNext={goNext}
            submitLabel="제출하기"
          />
        </form>
      </main>
    </>
  )
}

/**
 * 이미 낸 사람에게는 폼 대신 이 화면을 보여준다.
 *
 * 전에는 폼을 다 채우고 제출한 뒤에야 "중복된 학번입니다" 를 만났다. 정상 동작인데도 뭔가
 * 잘못된 것처럼 읽혀서, 아예 폼을 열지 않는다.
 */
function AlreadyAppliedScreen({ application }: { application: MyMemberApplication }) {
  return (
    <RecruitNotice
      title="이미 지원하셨습니다"
      message={`${formatSemesterLabel(application.admissionSemester)} 부원 지원서가 접수되어 있습니다. 한 학기에 한 번만 지원할 수 있습니다.`}
    >
      <section className="flex flex-col gap-3">
        <h2 className="text-[15px] font-medium text-dusk-ink-200">접수 내역</h2>
        <div className="flex flex-col gap-2.5 rounded-[14px] border border-[rgba(240,234,228,0.12)] px-5 py-[18px] text-[15px]">
          <div className="flex gap-3">
            <span className="w-24 shrink-0 text-dusk-ink-700">제출 일시</span>
            <span className="text-dusk-ink-100">{formatDateTime(application.createdAt)}</span>
          </div>
          <div className="flex gap-3">
            <span className="w-24 shrink-0 text-dusk-ink-700">회비 입금</span>
            <span className="text-dusk-ink-100">
              {application.isPayed ? '확인 완료' : '확인 전'}
            </span>
          </div>
        </div>
        <p className="text-[13px] leading-[1.7] text-dusk-ink-700">
          제출한 내용은{' '}
          <Link href="/profile/" className="text-ember underline underline-offset-2">
            프로필
          </Link>
          에서 확인할 수 있습니다.
        </p>
      </section>
    </RecruitNotice>
  )
}

type EntryState =
  | { kind: 'loading' }
  | { kind: 'login' }
  | { kind: 'error' }
  | { kind: 'applied'; application: MyMemberApplication }
  | { kind: 'form'; identity: Identity }

/**
 * 로그인 여부와 지원 이력을 먼저 확인하고 그에 맞는 화면을 고른다.
 *
 * 지원에는 로그인이 필요하다. 신원을 계정에서 가져오면 이름·학번 오타로 지원서와 계정이
 * 영영 안 이어지는 일이 없어지고, 이미 낸 사람은 폼을 열기 전에 걸러진다.
 */
function RecruitMemberEntry() {
  const { user } = useAuth()
  const { apiClient } = useAuthenticatedApi()
  const isLoggedIn = Boolean(user)
  const [state, setState] = useState<EntryState>({ kind: 'loading' })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!isLoggedIn) {
      setState({ kind: 'login' })
      return
    }

    let alive = true
    setState({ kind: 'loading' })

    Promise.all([fetchMyProfile(apiClient), fetchMyMemberApplication(apiClient)])
      .then(([profile, application]) => {
        if (!alive) return
        if (application) {
          setState({ kind: 'applied', application })
          return
        }
        setState({ kind: 'form', identity: toIdentity(profile) })
      })
      .catch(() => {
        // 401 은 useAuthenticatedApi 가 로그인으로 보낸다. 여기 오는 것은 그 밖의 실패다.
        if (alive) setState({ kind: 'error' })
      })

    return () => {
      alive = false
    }
  }, [apiClient, isLoggedIn, reloadKey])

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  if (state.kind === 'loading') return <Loader />

  if (state.kind === 'login') {
    return (
      <RecruitNotice
        title="로그인이 필요합니다"
        message="지원서에 들어가는 이름·학번·이메일을 계정에서 가져옵니다. 인하대학교(@inha.edu) 구글 계정으로 로그인해 주세요."
        action={{ label: '로그인하고 지원하기', href: LOGIN_HREF }}
      />
    )
  }

  if (state.kind === 'error') {
    return (
      <RecruitNotice
        title="지원 이력을 확인하지 못했습니다"
        message="일시적인 오류로 지원 가능 여부를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요."
        action={{ label: '다시 시도', onClick: reload }}
      />
    )
  }

  if (state.kind === 'applied') {
    return <AlreadyAppliedScreen application={state.application} />
  }

  return (
    <RecruitMemberForm
      identity={state.identity}
      apiClient={apiClient}
      preview={false}
      onAlreadyApplied={reload}
    />
  )
}

const toIdentity = (profile: UserProfile): Identity => ({
  name: profile.name,
  studentId: profile.studentId,
  email: profile.email,
  phoneNumber: profile.phoneNumber,
  major: profile.major
})

/**
 * 모집 기간 밖이면 폼 대신 안내를 보여준다. 카드 버튼만 잠그면 주소를 직접 친 사람은
 * 폼을 다 채운 뒤 제출에서 403 을 만난다.
 *
 * 게이트는 이 페이지에만 건다. 같은 layout 아래의 `/recruit/member/memo` 는 **모집 전에**
 * 연락처를 남겨두는 화면이라 기간으로 막으면 정반대가 된다.
 *
 * `?preview=1` 은 로그인 확인까지 통째로 건너뛴다. 제출은 이미 막혀 있고, 오픈 전에 폼을
 * 확인하려는 용도라 게이트가 그걸 가로막으면 쓸모가 없어진다.
 */
export default function Recruit() {
  const searchParams = useSearchParams()

  if (searchParams?.get('preview') === '1') {
    return (
      <RecruitMemberForm
        identity={PREVIEW_IDENTITY}
        apiClient={null}
        preview
        onAlreadyApplied={() => {}}
      />
    )
  }

  return (
    <RecruitMemberGate>
      <RecruitMemberEntry />
    </RecruitMemberGate>
  )
}
