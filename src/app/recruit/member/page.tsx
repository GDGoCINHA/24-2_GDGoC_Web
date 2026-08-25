'use client'

import React, { type FormEvent, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'

import RecruitMemberGate from '@/components/recruit/RecruitMemberGate'
import Loader from '@/components/ui/common/Loader'
import { PrivacyPolicyNotice } from '@/components/ui/common/PrivacyPolicyNotice'
import {
  DuskField,
  DUSK_CHECKBOX,
  DUSK_CHIP,
  DUSK_CHIP_ACTIVE,
  DUSK_GHOST_BUTTON,
  DUSK_INPUT,
  DUSK_OPTION,
  DUSK_SELECT,
  DUSK_SUBMIT_BUTTON,
  DUSK_TEXTAREA
} from '@/components/ui/dusk/DuskForm'
import { interestOptions } from '@/constant/interestOptions'
import { majorOptions } from '@/constant/majorOptions'
import { wishOptions } from '@/constant/wishOptions'
import { usePhoneNumber } from '@/hooks/usePhoneNumber'
import { cn } from '@/utils/cn'
import { formatDateInput } from '@/utils/date'

type RecruitFormState = {
  name: string
  gender: string
  birth: string
  major: string
  enrolledClassification: string
  studentId: string
  phoneNumber: string
  emailLocal: string
  emailDomain: string
  gdgInterest: string[]
  gdgWish: string[]
  gdgFeedback: string
  isPayed: boolean
  proofFile: File | null
}

type DuplicateCheckStatus = 'idle' | 'checking' | 'available' | 'duplicate' | 'unverified' | 'error'

type PresignedUploadResponse = {
  key?: string
  uploadUrl?: string
}

interface DuplicateCheckState {
  status: DuplicateCheckStatus
  message?: string
  checkedValue?: string
  verifiedValue?: string
}

const initialFormState: RecruitFormState = {
  name: '',
  gender: '',
  birth: '',
  major: '',
  enrolledClassification: '',
  studentId: '',
  phoneNumber: '',
  emailLocal: '',
  emailDomain: 'inha.edu',
  gdgInterest: [],
  gdgWish: [],
  gdgFeedback: '',
  isPayed: false,
  proofFile: null
}

const enrollmentOptions = ['재학', '부분등록', '휴학', '군휴학', '수료', '졸업']
const genderOptions = [
  { id: '남성', label: '남성' },
  { id: '여성', label: '여성' },
  { id: '비공개', label: '비공개' }
]

/** 중복 확인 결과 표시. 예전에는 GdgFieldContainer 의 status 를 썼다. */
type FieldStatus = 'success' | 'error' | undefined

function RecruitMemberForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { formatInput, isValidFormat, toDigits } = usePhoneNumber()
  const isPreview = searchParams?.get('preview') === '1'
  const [formData, setFormData] = useState<RecruitFormState>(initialFormState)
  const [loading, setLoading] = useState(false)
  const [studentCheckState, setStudentCheckState] = useState<DuplicateCheckState>({
    status: 'idle'
  })
  const [phoneCheckState, setPhoneCheckState] = useState<DuplicateCheckState>({ status: 'idle' })
  const [emailCheckState, setEmailCheckState] = useState<DuplicateCheckState>({ status: 'idle' })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [, setGlobalError] = useState<string | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) setFormData((prev) => ({ ...prev, proofFile: file }))
  }

  const handleFileRemove = () => {
    setFormData((prev) => ({ ...prev, proofFile: null }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleValueChange = (field: keyof RecruitFormState) => (value: string) => {
    const nextValue =
      field === 'phoneNumber'
        ? formatInput(value)
        : field === 'birth'
          ? formatDateInput(value)
          : value
    setFormData((prev) => ({ ...prev, [field]: nextValue }))

    if (field === 'studentId') {
      const trimmed = nextValue.trim()
      if (studentCheckState.verifiedValue === trimmed && trimmed !== '') {
        setStudentCheckState((prev) => ({
          ...prev,
          status: 'available',
          message: '※ 가입 가능한 학번입니다.',
          checkedValue: trimmed
        }))
      } else {
        setStudentCheckState((prev) => ({ status: 'idle', verifiedValue: prev.verifiedValue }))
      }
    }

    if (field === 'phoneNumber') {
      const trimmed = nextValue.trim()
      if (phoneCheckState.verifiedValue === trimmed && trimmed !== '') {
        setPhoneCheckState((prev) => ({
          ...prev,
          status: 'available',
          message: '※ 가입 가능한 전화번호입니다.',
          checkedValue: trimmed
        }))
      } else {
        setPhoneCheckState((prev) => ({ status: 'idle', verifiedValue: prev.verifiedValue }))
      }
    }

    if (field === 'emailLocal') {
      const currentEmail = `${nextValue.trim()}@${formData.emailDomain}`
      if (emailCheckState.verifiedValue === currentEmail && nextValue.trim() !== '') {
        setEmailCheckState((prev) => ({
          ...prev,
          status: 'available',
          message: '※ 가입 가능한 이메일입니다.',
          checkedValue: currentEmail
        }))
      } else {
        setEmailCheckState((prev) => ({ status: 'idle', verifiedValue: prev.verifiedValue }))
      }
    }
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

  const handleStudentCheck = async () => {
    const candidate = formData.studentId.trim()
    if (!candidate || candidate.length !== 8) return
    setStudentCheckState({ status: 'checking', checkedValue: candidate })
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/recruit/member/check/student-id`,
        { studentId: candidate }
      )
      const isExists = response.data?.data?.isExists
      if (isExists) {
        setStudentCheckState({
          status: 'duplicate',
          message: '※ 중복된 학번입니다.',
          checkedValue: candidate
        })
        return
      }
      setStudentCheckState({
        status: 'available',
        message: '※ 가입 가능한 학번입니다.',
        checkedValue: candidate,
        verifiedValue: candidate
      })
    } catch {
      setStudentCheckState({
        status: 'error',
        message: '※ 중복 확인 중 오류가 발생했습니다.',
        checkedValue: candidate
      })
    }
  }

  const handlePhoneCheck = async () => {
    const candidate = formData.phoneNumber.trim()
    if (!candidate || !isValidFormat(candidate)) return
    const digits = toDigits(candidate)
    setPhoneCheckState({ status: 'checking', checkedValue: digits })
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/recruit/member/check/phone-number`,
        { phoneNumber: digits }
      )
      const isExists = response.data?.data?.isExists
      if (isExists) {
        setPhoneCheckState({
          status: 'duplicate',
          message: '※ 중복된 전화번호입니다.',
          checkedValue: candidate
        })
        return
      }
      setPhoneCheckState({
        status: 'available',
        message: '※ 가입 가능한 전화번호입니다.',
        checkedValue: candidate,
        verifiedValue: candidate
      })
    } catch {
      setPhoneCheckState({
        status: 'error',
        message: '※ 중복 확인 중 오류가 발생했습니다.',
        checkedValue: candidate
      })
    }
  }

  const handleEmailCheck = async () => {
    const emailLocal = formData.emailLocal.trim()
    if (!emailLocal) return
    const fullEmail = `${emailLocal}@${formData.emailDomain}`
    setEmailCheckState({ status: 'checking', checkedValue: fullEmail })
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/recruit/member/check/email`,
        { email: fullEmail }
      )
      const isExists = response.data?.data?.isExists
      if (isExists) {
        setEmailCheckState({
          status: 'duplicate',
          message: '※ 중복된 이메일입니다.',
          checkedValue: fullEmail
        })
        return
      }
      setEmailCheckState({
        status: 'available',
        message: '※ 가입 가능한 이메일입니다.',
        checkedValue: fullEmail,
        verifiedValue: fullEmail
      })
    } catch {
      setEmailCheckState({
        status: 'error',
        message: '※ 중복 확인 중 오류가 발생했습니다.',
        checkedValue: fullEmail
      })
    }
  }

  const isFormValid = useMemo(() => {
    const required = ['name', 'gender', 'birth', 'major', 'enrolledClassification']
    const hasStrings = required.every(
      (f) => String(formData[f as keyof RecruitFormState]).trim() !== ''
    )
    const isChecksPassed =
      formData.studentId.trim() === studentCheckState.verifiedValue &&
      formData.phoneNumber.trim() === phoneCheckState.verifiedValue &&
      `${formData.emailLocal.trim()}@${formData.emailDomain}` === emailCheckState.verifiedValue
    const isProofPassed =
      formData.enrolledClassification !== '군휴학' || formData.proofFile !== null
    return (
      hasStrings &&
      formData.gdgInterest.length > 0 &&
      formData.gdgWish.length > 0 &&
      isChecksPassed &&
      isProofPassed &&
      formData.isPayed
    )
  }, [formData, phoneCheckState, studentCheckState, emailCheckState])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitted(true)
    if (isPreview || !isFormValid) return
    try {
      setLoading(true)
      const buildRecruitMap = () => {
        const map = new Map<number, Record<string, unknown>>()
        map.set(2, {
          name: formData.name,
          studentId: formData.studentId,
          enrolledClassification: formData.enrolledClassification
        })
        map.set(3, {
          phoneNumber: toDigits(formData.phoneNumber)
        })
        map.set(4, {
          gender: formData.gender,
          birth: formData.birth,
          email: `${formData.emailLocal.trim()}@${formData.emailDomain}`
        })
        map.set(5, { major: formData.major })
        map.set(6, {
          gdgInterest: formData.gdgInterest,
          gdgWish: formData.gdgWish,
          gdgFeedback: formData.gdgFeedback,
          isPayed: formData.isPayed
        })
        return map
      }
      const payload = Object.fromEntries(buildRecruitMap())
      if (formData.enrolledClassification === '군휴학' && formData.proofFile) {
        const proofFileKey = await uploadProofFile(formData.proofFile)
        const step6 = payload[6] as Record<string, unknown>
        payload[6] = {
          ...step6,
          proofFileUrl: proofFileKey
        }
      }
      await axios.post(`${process.env.NEXT_PUBLIC_BASE_API_URL}/recruit/member/apply`, payload)
      router.push('/recruit/member/completed?from=recruit')
    } catch (error: any) {
      setGlobalError(error.response?.data?.message || '지원서 제출 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const uploadProofFile = async (file: File) => {
    const presignedResponse = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_API_URL}/recruit/member/apply/proof-file/presigned-upload`,
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

  const studentStatus: FieldStatus =
    formData.studentId.trim() === studentCheckState.verifiedValue
      ? 'success'
      : studentCheckState.status === 'error' || studentCheckState.status === 'duplicate'
        ? 'error'
        : undefined
  const studentStatusMessage =
    formData.studentId.trim() === studentCheckState.verifiedValue
      ? '※ 가입 가능한 학번입니다.'
      : studentCheckState.message

  const phoneStatus: FieldStatus =
    formData.phoneNumber.trim() === phoneCheckState.verifiedValue
      ? 'success'
      : phoneCheckState.status === 'error' || phoneCheckState.status === 'duplicate'
        ? 'error'
        : undefined
  const phoneStatusMessage =
    formData.phoneNumber.trim() === phoneCheckState.verifiedValue
      ? '※ 가입 가능한 전화번호입니다.'
      : phoneCheckState.message

  const emailStatus: FieldStatus =
    `${formData.emailLocal.trim()}@${formData.emailDomain}` === emailCheckState.verifiedValue
      ? 'success'
      : emailCheckState.status === 'error' || emailCheckState.status === 'duplicate'
        ? 'error'
        : undefined
  const emailStatusMessage =
    `${formData.emailLocal.trim()}@${formData.emailDomain}` === emailCheckState.verifiedValue
      ? '※ 가입 가능한 이메일입니다.'
      : emailCheckState.message

  const enrollmentStatus: FieldStatus =
    isSubmitted && !formData.enrolledClassification ? 'error' : undefined
  const enrollmentStatusMessage =
    isSubmitted && !formData.enrolledClassification ? '※ 필수 선택 사항입니다.' : undefined

  const isStudentCheckDisabled =
    !formData.studentId.trim() ||
    formData.studentId.trim().length !== 8 ||
    studentCheckState.status === 'checking' ||
    formData.studentId.trim() === studentCheckState.verifiedValue
  const isPhoneCheckDisabled =
    !formData.phoneNumber.trim() ||
    !isValidFormat(formData.phoneNumber) ||
    phoneCheckState.status === 'checking' ||
    formData.phoneNumber.trim() === phoneCheckState.verifiedValue
  const isEmailCheckDisabled =
    !formData.emailLocal.trim() ||
    emailCheckState.status === 'checking' ||
    `${formData.emailLocal.trim()}@${formData.emailDomain}` === emailCheckState.verifiedValue

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

        <form onSubmit={handleSubmit} className="mt-[38px] flex flex-col gap-[22px]">
          <div className="grid gap-[18px] [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
            <DuskField label="이름" required>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleValueChange('name')(e.target.value)}
                placeholder="이름을 입력해 주세요."
                className={DUSK_INPUT}
              />
            </DuskField>
            <DuskField label="성별" required>
              <select
                value={formData.gender}
                onChange={(e) => handleValueChange('gender')(e.target.value)}
                className={DUSK_SELECT}
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
          </div>

          <DuskField label="생년월일" required>
            <input
              type="text"
              inputMode="numeric"
              value={formData.birth}
              onChange={(e) => handleValueChange('birth')(e.target.value)}
              placeholder="생년월일을 입력해 주세요. (YYYY.MM.DD)"
              className={DUSK_INPUT}
            />
          </DuskField>

          <DuskField label="주전공" required>
            <select
              value={formData.major}
              onChange={(e) => handleValueChange('major')(e.target.value)}
              className={DUSK_SELECT}
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
            {enrollmentStatusMessage ? (
              <span className="text-[13px] text-signal-err">{enrollmentStatusMessage}</span>
            ) : null}
          </div>

          {/* 군휴학은 회비 면제 대상이라 증빙을 받는다. 다른 상태에서는 칸 자체가 없다. */}
          {formData.enrolledClassification === '군휴학' && (
            <DuskField label="증빙 서류 (군 휴학)" required hint="포털에서 군휴학 신청내역 캡쳐">
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

          {/* 학번·전화번호·이메일은 중복 확인을 통과해야 제출된다. */}
          <DuskField
            label="학번"
            required
            hint={studentStatus === 'success' ? studentStatusMessage : undefined}
            error={studentStatus === 'error' ? studentStatusMessage : undefined}
          >
            <div className="flex items-center gap-2.5">
              <input
                type="text"
                inputMode="numeric"
                aria-label="학번"
                value={formData.studentId}
                onChange={(e) => handleValueChange('studentId')(e.target.value)}
                placeholder="학번을 입력해 주세요."
                className={cn(
                  'min-w-0 flex-1',
                  DUSK_INPUT,
                  studentStatus === 'error' && 'border-[rgba(196,88,74,0.6)]'
                )}
              />
              <button
                type="button"
                onClick={handleStudentCheck}
                disabled={isStudentCheckDisabled}
                className={DUSK_GHOST_BUTTON}
              >
                중복 확인
              </button>
            </div>
          </DuskField>

          <DuskField
            label="전화번호"
            required
            hint={phoneStatus === 'success' ? phoneStatusMessage : undefined}
            error={phoneStatus === 'error' ? phoneStatusMessage : undefined}
          >
            <div className="flex items-center gap-2.5">
              <input
                type="tel"
                aria-label="전화번호"
                value={formData.phoneNumber}
                onChange={(e) => handleValueChange('phoneNumber')(e.target.value)}
                placeholder="전화번호를 입력해 주세요. (010-1234-5678)"
                className={cn(
                  'min-w-0 flex-1',
                  DUSK_INPUT,
                  phoneStatus === 'error' && 'border-[rgba(196,88,74,0.6)]'
                )}
              />
              <button
                type="button"
                onClick={handlePhoneCheck}
                disabled={isPhoneCheckDisabled}
                className={DUSK_GHOST_BUTTON}
              >
                중복 확인
              </button>
            </div>
          </DuskField>

          <DuskField
            label="이메일"
            required
            hint={emailStatus === 'success' ? emailStatusMessage : undefined}
            error={emailStatus === 'error' ? emailStatusMessage : undefined}
          >
            <div className="flex flex-wrap items-center gap-2.5">
              <input
                type="text"
                aria-label="이메일 아이디"
                value={formData.emailLocal}
                onChange={(e) => handleValueChange('emailLocal')(e.target.value)}
                placeholder="이메일 아이디를 입력해 주세요."
                className={cn(
                  'min-w-[140px] flex-1',
                  DUSK_INPUT,
                  emailStatus === 'error' && 'border-[rgba(196,88,74,0.6)]'
                )}
              />
              <span className="shrink-0 text-[15px] text-dusk-ink-400">
                @{formData.emailDomain}
              </span>
              <button
                type="button"
                onClick={handleEmailCheck}
                disabled={isEmailCheckDisabled}
                className={DUSK_GHOST_BUTTON}
              >
                중복 확인
              </button>
            </div>
          </DuskField>

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
                  className={formData.gdgInterest.includes(option) ? DUSK_CHIP_ACTIVE : DUSK_CHIP}
                >
                  {option}
                </button>
              ))}
            </div>
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
          </div>

          <DuskField label="동아리 운영에 바라는 점" hint={`${formData.gdgFeedback.length} / 100`}>
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

          <PrivacyPolicyNotice target="member" showTitle={false} compact />

          <label className="flex cursor-pointer items-start gap-2.5 rounded-[14px] border border-[rgba(240,234,228,0.12)] px-[18px] py-4">
            <input
              type="checkbox"
              checked={formData.isPayed}
              onChange={(e) => setFormData((p) => ({ ...p, isPayed: e.target.checked }))}
              className={cn(DUSK_CHECKBOX, 'mt-[3px]')}
            />
            <span className="text-[15px] leading-[1.7] text-dusk-ink-400">
              개인정보 수집 및 이용, 개인정보 처리방침에 동의합니다.
              <span className="text-signal-err"> *</span>
            </span>
          </label>

          <div className="mt-1.5 flex">
            <button type="submit" disabled={!isFormValid || loading} className={DUSK_SUBMIT_BUTTON}>
              제출하기
            </button>
          </div>
        </form>
      </main>
    </>
  )
}

/**
 * 모집 기간 밖이면 폼 대신 안내를 보여준다. 카드 버튼만 잠그면 주소를 직접 친 사람은
 * 폼을 다 채운 뒤 제출에서 403 을 만난다.
 *
 * 게이트는 이 페이지에만 건다. 같은 layout 아래의 `/recruit/member/memo` 는 **모집 전에**
 * 연락처를 남겨두는 화면이라 기간으로 막으면 정반대가 된다.
 *
 * `?preview=1` 은 통과시킨다. 제출은 이미 막혀 있고(위 handleSubmit), 오픈 전에 폼을
 * 확인하려는 용도라 게이트가 그걸 가로막으면 쓸모가 없어진다.
 */
export default function Recruit() {
  const searchParams = useSearchParams()

  if (searchParams?.get('preview') === '1') return <RecruitMemberForm />

  return (
    <RecruitMemberGate>
      <RecruitMemberForm />
    </RecruitMemberGate>
  )
}
