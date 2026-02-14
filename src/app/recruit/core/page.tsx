'use client'

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

import {
  GdgButton,
  GdgCheckbox,
  GdgFieldContainer,
  GdgFileCard,
  GdgLogo,
  GdgMajorDropdown,
  GdgTextarea,
  GdgUploadButton,
  GdgInputField
} from '@/components/ui/design-system'
import { PrivacyPolicyNotice } from '@/components/ui/common/PrivacyPolicyNotice'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import { usePhoneNumber } from '@/hooks/usePhoneNumber'
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

const STEPS = ['기본정보', '내용작성', '일정안내', '약관동의'] as const
const TEAM_OPTIONS = [
  { id: 'BD', label: 'BD' },
  { id: 'HR', label: 'HR' },
  { id: 'TECH', label: 'TECH' },
  { id: 'PR/DESIGN', label: 'PR·DESIGN' }
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
    <div className="flex w-full items-center">
      {STEPS.map((step, index) => {
        const stepIndex = index as RecruitStep
        const isCurrent = stepIndex === currentStep
        const isActivated = stepIndex <= maxReachedStep
        const isClickable = stepIndex <= maxReachedStep
        const isLast = index === STEPS.length - 1

        return (
          <div key={step} className={cn('flex items-center', isLast ? '' : 'flex-1')}>
            <button
              type="button"
              onClick={() => onStepClick(stepIndex)}
              disabled={!isClickable}
              className={cn(
                'rounded-full border bg-black px-3 py-1.5 whitespace-nowrap typo-pc-b3 mobile:typo-m-c1 transition-colors',
                isCurrent && 'bg-red border-red text-white',
                !isCurrent && isActivated && 'border-red text-white',
                !isCurrent && !isActivated && 'border-gray-400 text-gray-400',
                isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
              )}
            >
              {step}
            </button>
            {!isLast && (
              <div
                className={cn('h-px flex-1', index < maxReachedStep ? 'bg-red' : 'bg-gray-400')}
              />
            )}
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
    <GdgFieldContainer
      label={label}
      required={required}
      caption={helper}
      status={error ? 'error' : undefined}
      statusMessage={error ? '※ 필수 입력 사항입니다.' : undefined}
    >
      <GdgTextarea
        name={name}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        rows={rows}
        state={error ? 'error' : 'default'}
        placeholder="내용을 입력해 주세요."
        fullWidth
      />
    </GdgFieldContainer>
  )
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start w-full">
      <span className="w-5 shrink-0 text-center text-[18px] mobile:text-[16px] leading-none font-bold mt-[1px]">
        •
      </span>
      <div className="typo-pc-b2 mobile:typo-m-b3 flex-1">{children}</div>
    </div>
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
          major: prev.major || payload.major || '',
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
      const payload = {
        snapshot: {
          name: formData.name,
          studentId: formData.studentId,
          phone: toDigits(formData.phone),
          major: formData.major,
          email: formData.email
        },
        team: formData.team,
        motivation: formData.motivation,
        wish: formData.role,
        strengths: formData.strength,
        pledge: formData.determination,
        fileUrls: []
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
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <form onSubmit={handleSubmit} noValidate className="pb-20 pt-18 mobile:pb-12 mobile:pt-12">
        <div className="layout-grid layout-grid--narrow-screen layout-grid--4 gap-y-8 mobile:gap-y-6">
          <div className="col-span-4 flex items-center gap-3 mobile:gap-2">
            <GdgLogo mode="auto" />
            <h1 className="typo-pc-h3 text-white mobile:typo-m-h2">Core Member 지원</h1>
          </div>

          <div className="col-span-4">
            <StepBar
              currentStep={currentStep}
              maxReachedStep={maxReachedStep}
              onStepClick={handleStepClick}
            />
          </div>

          {currentStep === 0 ? (
            <>
              <div className="col-span-4 rounded-xl bg-gray-100 px-4 py-3 mobile:px-3.5 mobile:py-3">
                <ul className="list-disc space-y-1 pl-5 typo-pc-b3 text-white mobile:typo-m-c1">
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
              </div>

              {prefillError ? (
                <p className="col-span-4 typo-pc-c1 mobile:typo-m-c2 text-red">{prefillError}</p>
              ) : null}

              <div className="col-span-4 grid grid-cols-4 gap-5 mobile:grid-cols-2 mobile:gap-2">
                <div className="col-span-1 mobile:col-span-1">
                  <GdgFieldContainer
                    label="이름"
                    required
                    status={errors.name ? 'error' : undefined}
                    statusMessage={errors.name ? '※ 필수 입력 사항입니다.' : undefined}
                  >
                    <div className="pc:contents hidden">
                      <GdgInputField
                        device="pc"
                        width="small"
                        aria-label="이름"
                        value={formData.name}
                        onChange={(e) => handleInputValueChange('name', e.target.value)}
                        placeholder="이름을 입력해 주세요."
                        disabled
                      />
                    </div>
                    <div className="pc:hidden contents">
                      <GdgInputField
                        device="mobile"
                        width="medium"
                        aria-label="이름"
                        value={formData.name}
                        onChange={(e) => handleInputValueChange('name', e.target.value)}
                        placeholder="이름을 입력해 주세요."
                        disabled
                      />
                    </div>
                  </GdgFieldContainer>
                </div>

                <div className="col-span-1 mobile:col-span-1">
                  <GdgFieldContainer
                    label="학번"
                    required
                    status={errors.studentId ? 'error' : undefined}
                    statusMessage={errors.studentId ? '※ 필수 입력 사항입니다.' : undefined}
                  >
                    <div className="pc:contents hidden">
                      <GdgInputField
                        device="pc"
                        width="small"
                        aria-label="학번"
                        value={formData.studentId}
                        onChange={(e) => handleInputValueChange('studentId', e.target.value)}
                        placeholder="학번을 입력해 주세요."
                        disabled
                      />
                    </div>
                    <div className="pc:hidden contents">
                      <GdgInputField
                        device="mobile"
                        width="medium"
                        aria-label="학번"
                        value={formData.studentId}
                        onChange={(e) => handleInputValueChange('studentId', e.target.value)}
                        placeholder="학번을 입력해 주세요."
                        disabled
                      />
                    </div>
                  </GdgFieldContainer>
                </div>

                <div className="col-span-2 mobile:col-span-2">
                  <GdgFieldContainer
                    label="이메일"
                    required
                    status={errors.email ? 'error' : undefined}
                    statusMessage={errors.email ? '※ 필수 입력 사항입니다.' : undefined}
                  >
                    <div className="pc:contents hidden">
                      <GdgInputField
                        device="pc"
                        width="medium"
                        aria-label="이메일"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputValueChange('email', e.target.value)}
                        placeholder="이메일을 입력해 주세요."
                        disabled
                      />
                    </div>
                    <div className="pc:hidden contents">
                      <GdgInputField
                        device="mobile"
                        fullWidth
                        aria-label="이메일"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputValueChange('email', e.target.value)}
                        placeholder="이메일을 입력해 주세요."
                        disabled
                      />
                    </div>
                  </GdgFieldContainer>
                </div>
              </div>

              <div className="col-span-4">
                <GdgFieldContainer
                  label="주전공"
                  required
                  caption="검색 혹은 스크롤하여 지정하세요."
                  status={errors.major ? 'error' : undefined}
                  statusMessage={errors.major ? '※ 필수 선택 사항입니다.' : undefined}
                >
                  <div className="hidden pc:block">
                    <GdgMajorDropdown
                      device="pc"
                      value={formData.major}
                      onChangeAction={(nextValue) => {
                        setFormData((prev) => ({ ...prev, major: nextValue }))
                      }}
                      isInvalid={Boolean(errors.major)}
                    />
                  </div>
                  <div className="block pc:hidden">
                    <GdgMajorDropdown
                      device="mobile"
                      value={formData.major}
                      onChangeAction={(nextValue) => {
                        setFormData((prev) => ({ ...prev, major: nextValue }))
                      }}
                      isInvalid={Boolean(errors.major)}
                    />
                  </div>
                </GdgFieldContainer>
              </div>

              <div className="col-span-4">
                <GdgFieldContainer
                  label="전화번호"
                  required
                  status={errors.phone ? 'error' : undefined}
                  statusMessage={errors.phone ? '※ 필수 입력 사항입니다.' : undefined}
                >
                  <div className="pc:contents hidden">
                    <GdgInputField
                      device="pc"
                      fullWidth
                      aria-label="전화번호"
                      value={formData.phone}
                      onChange={(e) => handleInputValueChange('phone', e.target.value)}
                      placeholder="전화번호를 입력해 주세요."
                      state={errors.phone ? 'error' : 'available'}
                    />
                  </div>
                  <div className="pc:hidden contents">
                    <GdgInputField
                      device="mobile"
                      fullWidth
                      aria-label="전화번호"
                      value={formData.phone}
                      onChange={(e) => handleInputValueChange('phone', e.target.value)}
                      placeholder="전화번호를 입력해 주세요."
                      state={errors.phone ? 'error' : 'available'}
                    />
                  </div>
                </GdgFieldContainer>
              </div>
            </>
          ) : null}

          {currentStep === 1 ? (
            <>
              <div className="col-span-4">
                <GdgFieldContainer
                  label="희망 팀"
                  required
                  status={errors.team ? 'error' : undefined}
                  statusMessage={errors.team ? '※ 필수 선택 사항입니다.' : undefined}
                >
                  <div className="grid grid-cols-4 gap-5 mobile:grid-cols-2 mobile:gap-2">
                    {TEAM_OPTIONS.map((team) => {
                      const selected = formData.team === team.id

                      return (
                        <div key={team.id}>
                          <div className="pc:contents hidden">
                            <GdgButton
                              type="button"
                              device="pc"
                              size="small"
                              variant={selected ? 'pressed' : 'bordered'}
                              widthToken="small"
                              onClick={() => handleTeamChange(team.id)}
                            >
                              {team.label}
                            </GdgButton>
                          </div>
                          <div className="pc:hidden contents">
                            <GdgButton
                              type="button"
                              device="mobile"
                              size="small"
                              variant={selected ? 'pressed' : 'bordered'}
                              widthToken="medium"
                              onClick={() => handleTeamChange(team.id)}
                            >
                              {team.label}
                            </GdgButton>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </GdgFieldContainer>
              </div>

              <div className="col-span-4">
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
              </div>

              <div className="col-span-4">
                <TextareaField
                  name="role"
                  label="희망 역할 및 수행하고 싶은 업무"
                  value={formData.role}
                  required
                  maxLength={500}
                  rows={6}
                  error={errors.role}
                  onChange={handleTextareaChange}
                />
              </div>

              <div className="col-span-4">
                <TextareaField
                  name="strength"
                  label="본인의 강점"
                  value={formData.strength}
                  required
                  maxLength={500}
                  rows={6}
                  helper="예시: 리더십/꼼꼼함/성실함, 자격증, 스킬, 툴, 수상/대외활동/인턴 등"
                  error={errors.strength}
                  onChange={handleTextareaChange}
                />
              </div>

              <div className="col-span-4">
                <TextareaField
                  name="determination"
                  label="각오"
                  value={formData.determination}
                  required
                  maxLength={100}
                  rows={2}
                  error={errors.determination}
                  onChange={handleTextareaChange}
                />
              </div>

              <div className="col-span-4 space-y-2">
                <div className="flex items-center gap-3 pl-2 mobile:gap-2">
                  <p className="typo-pc-s3 text-white mobile:typo-m-s2">파일 첨부</p>
                  <p className="typo-c2 text-gray-700">다중 파일 업로드 가능</p>
                </div>

                {formData.files.map((file, index) => (
                  <>
                    <div key={`pc-${file.name}-${index}`} className="hidden pc:block">
                      <GdgFileCard
                        device="pc"
                        fileName={file.name}
                        fileSize={formatFileSize(file.size)}
                        onAction={() => handleRemoveFile(index)}
                      />
                    </div>
                    <div key={`mobile-${file.name}-${index}`} className="block pc:hidden">
                      <GdgFileCard
                        device="mobile"
                        fileName={file.name}
                        fileSize={formatFileSize(file.size)}
                        onAction={() => handleRemoveFile(index)}
                      />
                    </div>
                  </>
                ))}

                <input
                  id="portfolio"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileInput}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.zip"
                />

                <GdgUploadButton
                  device="pc"
                  onClick={() => document.getElementById('portfolio')?.click()}
                  className="w-full"
                />
              </div>
            </>
          ) : null}

          {currentStep === 2 ? (
            <>
              <div className="col-span-4 space-y-2">
                <p className="pl-2 typo-pc-s2 mobile:typo-m-s1 text-white">모집 일정</p>
                <div className="rounded-xl bg-gray-100 px-4 py-3 text-white">
                  <div className="space-y-4 typo-pc-b2 mobile:space-y-3 mobile:typo-m-b3">
                    <div className="space-y-1">
                      <Bullet>서류 지원 기간</Bullet>
                      <p>2026. 2. 12.(목) - 2026. 3. 14.(토) 23:59:59</p>
                    </div>
                    <div className="space-y-1">
                      <Bullet>서류 결과 발표</Bullet>
                      <p>~ 2026. 3. 15.(일)</p>
                    </div>
                    <div className="space-y-1">
                      <Bullet>면접 진행 기간</Bullet>
                      <p>2026. 3. 16.(월) - 2026. 3. 20.(금)</p>
                      <p className="typo-c2 text-gray-700">
                        ※ 지원자 및 면접관 일정에 따라 마감 전 면접이 가능할 수 있습니다.
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Bullet>최종 결과 발표</Bullet>
                      <p>~ 2026. 3. 21.(토)</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-span-4 space-y-2">
                <p className="pl-2 typo-pc-s2 mobile:typo-m-s1 text-white">면접 안내</p>
                <div className="rounded-xl bg-gray-100 px-4 py-3 text-white typo-pc-b2 mobile:typo-m-b3">
                  <Bullet>원칙적으로 대면 면접을 진행하며, 부득이한 경우 비대면으로 조정될 수 있습니다.</Bullet>
                  <div className="mt-2">
                    <Bullet>면접은 인하대학교 내부 장소에서 진행됩니다.</Bullet>
                  </div>
                </div>
              </div>

              <div className="col-span-4 space-y-4">
                <div className="space-y-2">
                  <p className="pl-2 typo-pc-s2 mobile:typo-m-s1 text-white">활동 안내</p>
                  <div className="rounded-xl bg-gray-100 px-4 py-3 text-white typo-pc-b2 mobile:typo-m-b3">
                    <Bullet>운영진으로 활동 시, 매주 1회 정기 운영진 회의에 필수 참석해야 합니다.</Bullet>
                    <p className="mt-1 typo-c2 text-gray-700">※ 일정은 3월 내로 공지 드립니다.</p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <span className="typo-pc-b3 mobile:typo-m-c1 text-red">*</span>
                  <p className="typo-pc-b3 mobile:typo-m-c1 text-white">전체 일정을 확인하였습니다.</p>
                  <span className="hidden pc:inline-flex">
                    <GdgCheckbox
                      checked={scheduleChecked}
                      onCheckedChange={setScheduleChecked}
                      size="pc"
                    />
                  </span>
                  <span className="inline-flex pc:hidden">
                    <GdgCheckbox
                      checked={scheduleChecked}
                      onCheckedChange={setScheduleChecked}
                      size="mobile"
                    />
                  </span>
                </div>
              </div>

              {errors.scheduleCheck ? (
                <p className="col-span-4 text-right typo-c2 text-red">
                  ※ 미확인 시 지원서 제출이 불가합니다.
                </p>
              ) : null}
            </>
          ) : null}

          {currentStep === 3 ? (
            <>
              <div className="col-span-4 space-y-4">
                <div className="space-y-2">
                  <p className="pl-2 typo-pc-s2 mobile:typo-m-s1 text-white">개인정보 수집 및 이용 동의</p>
                  <PrivacyPolicyNotice target="core" showTitle={false} compact />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <span className="typo-pc-b3 mobile:typo-m-c1 text-red">*</span>
                  <p className="typo-pc-b3 mobile:typo-m-c1 text-white">개인정보 처리방침에 동의합니다.</p>
                  <span className="hidden pc:inline-flex">
                    <GdgCheckbox
                      checked={agreementChecked}
                      onCheckedChange={setAgreementChecked}
                      size="pc"
                    />
                  </span>
                  <span className="inline-flex pc:hidden">
                    <GdgCheckbox
                      checked={agreementChecked}
                      onCheckedChange={setAgreementChecked}
                      size="mobile"
                    />
                  </span>
                </div>
              </div>

              {errors.agreementCheck ? (
                <p className="col-span-4 text-right typo-c2 text-red">
                  ※ 미동의 시 지원서 제출이 불가합니다.
                </p>
              ) : null}
            </>
          ) : null}

          <div className="col-span-4 hidden justify-end gap-5 pt-2 pc:flex">
            {currentStep > 0 ? (
              <GdgButton
                type="button"
                device="pc"
                size="small"
                variant="default"
                widthToken="small"
                onClick={handlePrevious}
              >
                이전
              </GdgButton>
            ) : null}

            <GdgButton
              type="submit"
              device="pc"
              size="small"
              variant={isCurrentStepValid ? 'active' : 'disabled'}
              widthToken="small"
              disabled={!isCurrentStepValid}
            >
              {currentStep === 3 ? '제출하기' : '다음'}
            </GdgButton>
          </div>

          <div className="col-span-4 grid grid-cols-3 gap-2 pt-0 pc:hidden">
            <span aria-hidden />
            {currentStep > 0 ? (
              <GdgButton
                type="button"
                device="mobile"
                size="small"
                variant="default"
                fullWidth
                onClick={handlePrevious}
              >
                이전
              </GdgButton>
            ) : (
              <span aria-hidden />
            )}

            <GdgButton
              type="submit"
              device="mobile"
              size="small"
              variant={isCurrentStepValid ? 'active' : 'disabled'}
              fullWidth
              disabled={!isCurrentStepValid}
            >
              {currentStep === 3 ? '제출하기' : '다음'}
            </GdgButton>
          </div>
        </div>
      </form>
    </main>
  )
}
