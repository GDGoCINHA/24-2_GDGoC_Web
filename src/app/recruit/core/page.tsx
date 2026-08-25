'use client'

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

import Link from 'next/link'

import { RecruitScheduleCard } from '@/components/recruit/RecruitScheduleCard'
import { PrivacyPolicyNotice } from '@/components/ui/common/PrivacyPolicyNotice'
import {
  DuskField,
  DUSK_CANCEL_BUTTON,
  DUSK_CHECKBOX,
  DUSK_CHIP,
  DUSK_CHIP_ACTIVE,
  DUSK_INPUT,
  DUSK_INPUT_READONLY,
  DUSK_OPTION,
  DUSK_SELECT,
  DUSK_SUBMIT_BUTTON,
  DUSK_TEXTAREA
} from '@/components/ui/dusk/DuskForm'
import { majorOptions, normalizeMajorCode } from '@/constant/majorOptions'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import { usePhoneNumber } from '@/hooks/usePhoneNumber'
import { unwrapApiResponse } from '@/utils/api/unwrap'
import { cn } from '@/utils/cn'

type RecruitStep = 0 | 1 | 2 | 3

type FormFile = {
  name: string
  size: number
  file?: File
}

type RecruitFormData = {
  name: string
  studentId: string
  email: string
  major: string
  phone: string
  team: string
  motivation: string
  role: string
  strength: string
  determination: string
  files: FormFile[]
}

type PrefillPayload = {
  name?: string
  studentId?: string
  email?: string
  major?: string
  phone?: string
}

type PresignedUploadResponse = {
  key?: string
  uploadUrl?: string
}

const STEPS = ['기본정보', '내용작성', '일정안내', '약관동의'] as const
const TEAM_OPTIONS = [
  { id: 'BD', label: 'BD' },
  { id: 'HR', label: 'HR' },
  { id: 'TECH', label: 'TECH' },
  { id: 'PR_DESIGN', label: 'PR·DESIGN' }
] as const

const unwrapPrefill = (raw: unknown): PrefillPayload | null => {
  if (!raw || typeof raw !== 'object') return null

  const record = raw as Record<string, unknown>
  if ('data' in record && record.data && typeof record.data === 'object') {
    return unwrapPrefill(record.data)
  }

  const readString = (key: keyof PrefillPayload) => {
    const value = record[key]
    return typeof value === 'string' ? value : undefined
  }

  return {
    name: readString('name'),
    studentId: readString('studentId'),
    email: readString('email'),
    major: readString('major'),
    phone: readString('phone')
  }
}

const formatFileSize = (bytes: number) => {
  if (!bytes) return '0.00mb'
  const mb = bytes / 1024 / 1024
  return `${mb.toFixed(2)}mb`
}

function StepBar({
  currentStep,
  maxReachedStep,
  onStepClick
}: {
  currentStep: RecruitStep
  maxReachedStep: RecruitStep
  onStepClick: (step: RecruitStep) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {STEPS.map((step, index) => {
        const stepIndex = index as RecruitStep
        const isCurrent = stepIndex === currentStep
        // 지나온 단계만 되돌아갈 수 있다. 앞선 단계는 검증을 건너뛰게 되므로 막는다.
        const isClickable = stepIndex <= maxReachedStep

        return (
          <div key={step} className="flex items-center gap-2">
            {index > 0 && <span className="text-dusk-ink-800">·</span>}
            <button
              type="button"
              onClick={() => onStepClick(stepIndex)}
              disabled={!isClickable}
              className={cn(
                'whitespace-nowrap rounded-full px-4 py-[9px] text-sm transition-colors',
                isCurrent
                  ? 'bg-ember text-ember-ink'
                  : isClickable
                    ? 'cursor-pointer text-dusk-ink-500 hover:text-dusk-ink-100'
                    : 'cursor-not-allowed text-dusk-ink-700'
              )}
            >
              {step}
            </button>
          </div>
        )
      })}
    </div>
  )
}

function TextareaField({
  name,
  label,
  value,
  maxLength,
  rows,
  required,
  error,
  helper,
  onChange
}: {
  name: keyof RecruitFormData
  label: string
  value: string
  maxLength: number
  rows: number
  required?: boolean
  error?: boolean
  helper?: string
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void
}) {
  return (
    <DuskField
      label={label}
      required={required}
      hint={helper}
      error={error ? '※ 필수 입력 사항입니다.' : undefined}
    >
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        rows={rows}
        placeholder="내용을 입력해 주세요."
        className={cn(DUSK_TEXTAREA, error && 'border-[rgba(196,88,74,0.6)]')}
      />
      <span className="self-end text-[13px] text-dusk-ink-800">
        {value.length} / {maxLength}
      </span>
    </DuskField>
  )
}

export default function RecruitCore() {
  const router = useRouter()
  const { apiClient } = useAuthenticatedApi()
  const { formatInput, toDigits } = usePhoneNumber()

  const [currentStep, setCurrentStep] = useState<RecruitStep>(0)
  const [maxReachedStep, setMaxReachedStep] = useState<RecruitStep>(0)
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const [prefillError, setPrefillError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [scheduleChecked, setScheduleChecked] = useState(false)
  const [agreementChecked, setAgreementChecked] = useState(false)

  const [formData, setFormData] = useState<RecruitFormData>({
    name: '',
    studentId: '',
    email: '',
    major: '',
    phone: '',
    team: '',
    motivation: '',
    role: '',
    strength: '',
    determination: '',
    files: []
  })

  const isCurrentStepValid = useMemo(() => {
    if (currentStep === 0) {
      return Boolean(
        formData.name.trim() &&
        formData.studentId.trim() &&
        formData.email.trim() &&
        formData.major.trim() &&
        formData.phone.trim()
      )
    }
    if (currentStep === 1) {
      return Boolean(
        formData.team.trim() &&
        formData.motivation.trim() &&
        formData.role.trim() &&
        formData.strength.trim() &&
        formData.determination.trim()
      )
    }
    if (currentStep === 2) return scheduleChecked
    if (currentStep === 3) return agreementChecked
    return false
  }, [currentStep, formData, scheduleChecked, agreementChecked])

  useEffect(() => {
    let active = true

    const fetchPrefill = async () => {
      try {
        const response = await apiClient.get('/recruit/core/prefill')
        if (!active) return

        const payload = unwrapPrefill(response.data)
        if (!payload) return

        setFormData((prev) => ({
          ...prev,
          name: prev.name || payload.name || '',
          studentId: prev.studentId || payload.studentId || '',
          email: prev.email || payload.email || '',
          major: prev.major || normalizeMajorCode(payload.major) || '',
          phone: formatInput(prev.phone || payload.phone || '')
        }))
      } catch (error: any) {
        if (!active) return
        const errorCode = error.response?.data?.code
        if (errorCode === 'ALREADY_APPLIED') {
          alert('이미 지원이 완료되었습니다. 제출된 지원서는 마이페이지에서 확인하실 수 있습니다.')
          router.replace('/recruit/core/completed')
        } else {
          console.error('[코어 리크루팅] 기본 정보 불러오기에 실패했습니다.', error)
          setPrefillError('기본 정보를 불러오지 못했습니다. 직접 입력해주세요.')
        }
      }
    }

    void fetchPrefill()

    return () => {
      active = false
    }
  }, [apiClient, router])

  const validateStep = (step: RecruitStep) => {
    const nextErrors: Record<string, boolean> = {}

    if (step === 0) {
      if (!formData.name.trim()) nextErrors.name = true
      if (!formData.studentId.trim()) nextErrors.studentId = true
      if (!formData.email.trim()) nextErrors.email = true
      if (!formData.major.trim()) nextErrors.major = true
      if (!formData.phone.trim()) nextErrors.phone = true
    }

    if (step === 1) {
      if (!formData.team.trim()) nextErrors.team = true
      if (!formData.motivation.trim()) nextErrors.motivation = true
      if (!formData.role.trim()) nextErrors.role = true
      if (!formData.strength.trim()) nextErrors.strength = true
      if (!formData.determination.trim()) nextErrors.determination = true
    }

    if (step === 2 && !scheduleChecked) nextErrors.scheduleCheck = true
    if (step === 3 && !agreementChecked) nextErrors.agreementCheck = true

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleInputValueChange = (name: keyof RecruitFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'phone' ? formatInput(value) : value
    }))
  }

  const handleTextareaChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = event.target

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleTeamChange = (team: string) => {
    setFormData((prev) => ({
      ...prev,
      team
    }))

    setErrors((prev) => {
      if (!prev.team) return prev
      const next = { ...prev }
      delete next.team
      return next
    })
  }

  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const nextFiles = Array.from(files).map<FormFile>((file) => ({
      name: file.name,
      size: file.size,
      file
    }))

    setFormData((prev) => ({
      ...prev,
      files: [...prev.files, ...nextFiles]
    }))

    event.target.value = ''
  }

  const handleRemoveFile = (targetIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, index) => index !== targetIndex)
    }))
  }

  const handlePrevious = () => {
    if (currentStep === 0) return
    setErrors({})
    setCurrentStep((currentStep - 1) as RecruitStep)
  }

  const handleStepClick = (step: RecruitStep) => {
    if (step > maxReachedStep) return
    setErrors({})
    setCurrentStep(step)
  }

  const uploadAttachedFiles = async (files: FormFile[]) => {
    const uploadTargets = files.filter((item): item is FormFile & { file: File } =>
      Boolean(item.file)
    )
    if (uploadTargets.length === 0) return []

    const uploads = uploadTargets.map(async (target) => {
      const presignedResponse = await apiClient.post('/resource/presigned-upload', {
        fileName: target.file.name,
        contentType: target.file.type || 'application/octet-stream',
        fileSize: target.file.size,
        s3key: 'recruitCore'
      })

      const payload = unwrapApiResponse<PresignedUploadResponse>(presignedResponse.data)
      if (!payload?.key || !payload.uploadUrl) {
        throw new Error(`${target.name} 업로드 URL 발급 응답이 올바르지 않습니다.`)
      }

      const uploadResponse = await fetch(payload.uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': target.file.type || 'application/octet-stream'
        },
        body: target.file
      })

      if (!uploadResponse.ok) {
        throw new Error(`${target.name} S3 업로드에 실패했습니다.`)
      }

      return payload.key
    })

    return Promise.all(uploads)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!validateStep(currentStep)) return

    if (currentStep < 3) {
      const nextStep = (currentStep + 1) as RecruitStep
      setCurrentStep(nextStep)
      setMaxReachedStep((prev) => (nextStep > prev ? nextStep : prev))
      setErrors({})
      return
    }

    try {
      setIsSubmitting(true)
      const fileUrls = await uploadAttachedFiles(formData.files)

      const payload = {
        snapshot: {
          name: formData.name,
          studentId: formData.studentId,
          phone: toDigits(formData.phone),
          major: normalizeMajorCode(formData.major),
          email: formData.email
        },
        team: formData.team,
        motivation: formData.motivation,
        wish: formData.role,
        strengths: formData.strength,
        pledge: formData.determination,
        fileUrls
      }

      await apiClient.post('/recruit/core/applications', payload)
      alert('지원서가 제출되었습니다!')
      router.replace('/recruit/core/completed')
    } catch (error: any) {
      if (error?.response?.status === 409) {
        alert('이미 지원이 완료되었습니다.')
        router.replace('/recruit/core/completed')
      } else {
        alert('지원서 제출 중 오류가 발생했습니다.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-[760px] px-[clamp(20px,5vw,44px)] pb-[100px] pt-14">
      <Link
        href="/recruit/"
        className="text-[13px] text-dusk-ink-800 transition-colors hover:text-dusk-ink-100"
      >
        ← 지원 종류 선택
      </Link>
      <h1 className="mt-6 text-[clamp(24px,2.8vw,34px)] font-semibold leading-[1.26] tracking-[-0.03em]">
        운영진(Core) 지원서
      </h1>
      <p className="mt-3 text-[15px] text-dusk-ink-600">GDGoC INHA 2026-2 운영진 모집</p>

      <div className="mt-[34px]">
        <StepBar
          currentStep={currentStep}
          maxReachedStep={maxReachedStep}
          onStepClick={handleStepClick}
        />
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {currentStep === 0 ? (
          <div className="mt-[34px] flex flex-col gap-5">
            <ul className="flex list-disc flex-col gap-1 rounded-[14px] border border-[rgba(240,234,228,0.12)] py-4 pl-9 pr-5 text-sm leading-[1.7] text-dusk-ink-300">
              <li>
                아래 정보는 회원가입 시 입력한 정보를 기반으로 <b>자동 입력</b>됩니다.
              </li>
              <li>
                <b>지원서 제출 시점의 정보를 기준으로 저장</b>됩니다.
              </li>
              <li>
                예상 소요 시간: <b>약 10~15분</b>
              </li>
            </ul>

            {prefillError ? <p className="text-[13px] text-signal-err">{prefillError}</p> : null}

            {/* 이름·학번·이메일은 회원 정보를 그대로 쓴다. 여기서 고칠 수 없다. */}
            <div className="grid gap-[18px] [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
              <DuskField label="이름" required>
                <input type="text" value={formData.name} disabled className={DUSK_INPUT_READONLY} />
              </DuskField>
              <DuskField label="학번" required>
                <input
                  type="text"
                  value={formData.studentId}
                  disabled
                  className={DUSK_INPUT_READONLY}
                />
              </DuskField>
            </div>

            <DuskField label="이메일" required>
              <input type="email" value={formData.email} disabled className={DUSK_INPUT_READONLY} />
            </DuskField>

            <DuskField
              label="주전공"
              required
              error={errors.major ? '※ 필수 선택 사항입니다.' : undefined}
            >
              <select
                value={formData.major}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, major: event.target.value }))
                }
                className={cn(DUSK_SELECT, errors.major && 'border-[rgba(196,88,74,0.6)]')}
              >
                <option value="" className={DUSK_OPTION}>
                  주전공을 선택해 주세요.
                </option>
                {majorOptions.map((group) => (
                  <optgroup key={group.title} label={group.title} className={DUSK_OPTION}>
                    {group.items.map((item) => (
                      <option key={item.code} value={item.code} className={DUSK_OPTION}>
                        {item.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </DuskField>

            <DuskField
              label="전화번호"
              required
              error={errors.phone ? '※ 필수 입력 사항입니다.' : undefined}
            >
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputValueChange('phone', e.target.value)}
                placeholder="전화번호를 입력해 주세요."
                className={cn(DUSK_INPUT, errors.phone && 'border-[rgba(196,88,74,0.6)]')}
              />
            </DuskField>
          </div>
        ) : null}

        {currentStep === 1 ? (
          <div className="mt-[34px] flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <span className="text-[13px] text-dusk-ink-700">
                희망 팀<span className="text-signal-err"> *</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {TEAM_OPTIONS.map((team) => (
                  <button
                    key={team.id}
                    type="button"
                    onClick={() => handleTeamChange(team.id)}
                    className={formData.team === team.id ? DUSK_CHIP_ACTIVE : DUSK_CHIP}
                  >
                    {team.label}
                  </button>
                ))}
              </div>
              {errors.team ? (
                <span className="text-[13px] text-signal-err">※ 필수 선택 사항입니다.</span>
              ) : null}
            </div>

            <TextareaField
              name="motivation"
              label="지원 동기"
              value={formData.motivation}
              required
              maxLength={500}
              rows={6}
              error={errors.motivation}
              onChange={handleTextareaChange}
            />
            <TextareaField
              name="role"
              label="희망 역할 및 수행하고 싶은 업무"
              value={formData.role}
              required
              maxLength={500}
              rows={5}
              error={errors.role}
              onChange={handleTextareaChange}
            />
            <TextareaField
              name="strength"
              label="본인의 강점"
              value={formData.strength}
              required
              maxLength={500}
              rows={5}
              helper="예시: 리더십/꼼꼼함/성실함, 자격증, 스킬, 툴, 수상/대외활동/인턴 등"
              error={errors.strength}
              onChange={handleTextareaChange}
            />
            <TextareaField
              name="determination"
              label="각오"
              value={formData.determination}
              required
              maxLength={100}
              rows={3}
              error={errors.determination}
              onChange={handleTextareaChange}
            />

            <div className="flex flex-col gap-3">
              <span className="text-[13px] text-dusk-ink-700">
                파일 첨부 <span className="text-dusk-ink-800">(다중 업로드 가능)</span>
              </span>

              {formData.files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center gap-3 rounded-[10px] bg-[rgba(240,234,228,0.06)] px-4 py-[9px] text-[15px] text-dusk-ink-100"
                >
                  <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                    {file.name}
                  </span>
                  <span className="shrink-0 text-sm text-dusk-ink-800">
                    {formatFileSize(file.size)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="shrink-0 text-sm text-dusk-ink-800 transition-colors hover:text-signal-err"
                  >
                    삭제
                  </button>
                </div>
              ))}

              <input
                id="portfolio"
                type="file"
                multiple
                className="hidden"
                onChange={handleFileInput}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.zip"
              />
              <button
                type="button"
                onClick={() => document.getElementById('portfolio')?.click()}
                className="w-full rounded-xl border border-[rgba(240,234,228,0.22)] px-6 py-[15px] text-[15px] text-dusk-ink-100 transition-colors hover:border-[rgba(208,129,85,0.6)] hover:bg-[rgba(208,129,85,0.06)]"
              >
                + 파일 선택
              </button>
            </div>
          </div>
        ) : null}

        {currentStep === 2 ? (
          <div className="mt-[34px] flex flex-col gap-4">
            <RecruitScheduleCard />

            <label className="flex cursor-pointer items-start gap-2.5 rounded-[14px] border border-[rgba(240,234,228,0.12)] px-[18px] py-4">
              <input
                type="checkbox"
                checked={scheduleChecked}
                onChange={(event) => setScheduleChecked(event.target.checked)}
                className={cn(DUSK_CHECKBOX, 'mt-[3px]')}
              />
              <span className="text-[15px] leading-[1.7] text-dusk-ink-400">
                전체 일정을 확인하였습니다.<span className="text-signal-err"> *</span>
              </span>
            </label>

            {errors.scheduleCheck ? (
              <p className="text-[13px] text-signal-err">※ 미확인 시 지원서 제출이 불가합니다.</p>
            ) : null}
          </div>
        ) : null}

        {currentStep === 3 ? (
          <div className="mt-[34px] flex flex-col gap-4">
            <PrivacyPolicyNotice target="core" showTitle={false} compact />

            <label className="flex cursor-pointer items-start gap-2.5 rounded-[14px] border border-[rgba(240,234,228,0.12)] px-[18px] py-4">
              <input
                type="checkbox"
                checked={agreementChecked}
                onChange={(event) => setAgreementChecked(event.target.checked)}
                className={cn(DUSK_CHECKBOX, 'mt-[3px]')}
              />
              <span className="text-[15px] leading-[1.7] text-dusk-ink-400">
                개인정보 수집 및 이용, 개인정보 처리방침에 동의합니다.
                <span className="text-signal-err"> *</span>
              </span>
            </label>

            {errors.agreementCheck ? (
              <p className="text-[13px] text-signal-err">※ 미동의 시 지원서 제출이 불가합니다.</p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-7 flex gap-2.5">
          {currentStep > 0 ? (
            <button type="button" onClick={handlePrevious} className={DUSK_CANCEL_BUTTON}>
              이전
            </button>
          ) : null}
          <button
            type="submit"
            disabled={!isCurrentStepValid || isSubmitting}
            className={DUSK_SUBMIT_BUTTON}
          >
            {currentStep === 3 ? (isSubmitting ? '제출 중...' : '제출하기') : '다음'}
          </button>
        </div>
      </form>
    </main>
  )
}
