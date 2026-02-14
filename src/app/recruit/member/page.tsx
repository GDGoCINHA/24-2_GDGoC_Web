'use client'

import React, {type FormEvent, useMemo, useRef, useState} from 'react'
import {useRouter, useSearchParams} from 'next/navigation'
import {Select, SelectItem} from '@nextui-org/react'
import axios from 'axios'

import Loader from '@/components/ui/common/Loader'
import {PrivacyPolicyNotice} from '@/components/ui/common/PrivacyPolicyNotice'
import {
    GdgButton,
    GdgCheckbox,
    GdgDropdown,
    GdgFieldContainer,
    type GdgFieldStatus,
    GdgFileCard,
    GdgInputField,
    GdgLogo,
    GdgMajorDropdown,
    GdgTextarea,
    GdgUploadButton
} from '@/components/ui/design-system'
import {interestOptions} from '@/constant/interestOptions'
import {wishOptions} from '@/constant/wishOptions'
import {formatRecruitData} from '@/utils/formatRecruitData'
import {formatDateInput} from '@/utils/date'
import {formatPhoneNumberInput, isPhoneNumberFormatValid, toPhoneDigits} from '@/utils/phoneNumber'

type RecruitFormState = {
  privacyAgreement: boolean
  name: string
  gender: string
  birth: string
  major: string
  enrolledClassification: string
  grade: string
  studentId: string
  phoneNumber: string
  nationality: string
  emailLocal: string
  emailDomain: string
  gdgInterest: string[]
  gdgWish: string[]
  gdgPeriod: string[]
  gdgRoute: string
  gdgRouteEtc: string
  gdgExpect: string[]
  gdgFeedback: string
  isPayed: boolean
  proofFile: File | null
}

type DuplicateCheckStatus = 'idle' | 'checking' | 'available' | 'duplicate' | 'unverified' | 'error'

interface DuplicateCheckState {
  status: DuplicateCheckStatus
  message?: string
  checkedValue?: string
  verifiedValue?: string
}

const initialFormState: RecruitFormState = {
  privacyAgreement: false,
  name: '',
  gender: '',
  birth: '',
  major: '',
  enrolledClassification: '',
  grade: '1학년',
  studentId: '',
  phoneNumber: '',
  nationality: '대한민국',
  emailLocal: '',
  emailDomain: 'inha.edu',
  gdgInterest: [],
  gdgWish: [],
  gdgPeriod: [],
  gdgRoute: '기타',
  gdgRouteEtc: '',
  gdgExpect: [],
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

const recruitMultiSelectClassNames = {
  trigger:
    'h-11 rounded-full bg-black border border-gray-800 px-4 data-[hover=true]:border-gray-900 data-[open=true]:border-white',
  value: 'text-gray-700 typo-b2 mobile:typo-m-b3',
  popoverContent:
    'bg-gray-100 border border-white/10 rounded-xl shadow-[0_20px_120px_rgba(0,0,0,0.75)] p-3',
  listboxWrapper: 'max-h-58',
  listbox: 'p-0 m-0'
}

const recruitMultiSelectItemClasses = {
  base: [
    'h-9 px-2 rounded-lg flex items-center justify-between',
    'text-white typo-b2 mobile:typo-m-b3 font-medium',
    'data-[hover=true]:bg-white data-[hover=true]:text-black',
    'data-[selected=true]:font-medium',
    'data-[hover=true]:[&_[data-slot=selected-icon]]:text-black'
  ].join(' '),
  title: 'font-medium'
}

export default function Recruit() {
  const router = useRouter()
  const searchParams = useSearchParams()
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

  const interestDropdownOptions = useMemo(
    () => interestOptions.map((option) => ({ id: option, label: option })),
    []
  )
  const wishDropdownOptions = useMemo(
    () => wishOptions.map((option) => ({ id: option, label: option })),
    []
  )

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
        ? formatPhoneNumberInput(value)
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

  const handleLimitedMultiSelection =
    (field: 'gdgInterest' | 'gdgWish', label: string) => (rawValue: string) => {
      const selected = rawValue
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
      if (selected.length > 3) {
        alert(`${label}는 최대 3개까지 선택할 수 있습니다.`)
        return
      }
      setFormData((prev) => ({ ...prev, [field]: selected }))
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
    if (!candidate || !isPhoneNumberFormatValid(candidate)) return
    const digits = toPhoneDigits(candidate)
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
        map.set(1, { isAgree: formData.isPayed })
        map.set(2, {
          name: formData.name,
          studentId: formData.studentId,
          enrolledClassification: formData.enrolledClassification
        })
        map.set(3, {
          grade: formData.grade,
          phoneNumber: toPhoneDigits(formData.phoneNumber),
          nationality: formData.nationality
        })
        map.set(4, {
          gender: formData.gender,
          birth: formData.birth,
          email: `${formData.emailLocal.trim()}@${formData.emailDomain}`
        })
        map.set(5, { major: formData.major })
        map.set(10, { gdgFeedback: formData.gdgFeedback })
        map.set(11, { isPayed: formData.isPayed })
        return map
      }
      const formattedData = formatRecruitData(buildRecruitMap())
      if (formData.enrolledClassification === '군휴학' && formData.proofFile) {
        const fd = new FormData()
        fd.append(
          'request',
          new Blob([JSON.stringify(formattedData)], { type: 'application/json' })
        )
        fd.append('file', formData.proofFile)
        await axios.post(`${process.env.NEXT_PUBLIC_BASE_API_URL}/recruit/member/apply`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/recruit/member/apply`,
          formattedData
        )
      }
      router.push('/recruit/member/completed?from=recruit')
    } catch (error: any) {
      setGlobalError(error.response?.data?.message || '지원서 제출 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const studentStatus: GdgFieldStatus | undefined =
    formData.studentId.trim() === studentCheckState.verifiedValue
      ? 'success'
      : studentCheckState.status === 'error' || studentCheckState.status === 'duplicate'
        ? 'error'
        : undefined
  const studentStatusMessage =
    formData.studentId.trim() === studentCheckState.verifiedValue
      ? '※ 가입 가능한 학번입니다.'
      : studentCheckState.message

  const phoneStatus: GdgFieldStatus | undefined =
    formData.phoneNumber.trim() === phoneCheckState.verifiedValue
      ? 'success'
      : phoneCheckState.status === 'error' || phoneCheckState.status === 'duplicate'
        ? 'error'
        : undefined
  const phoneStatusMessage =
    formData.phoneNumber.trim() === phoneCheckState.verifiedValue
      ? '※ 가입 가능한 전화번호입니다.'
      : phoneCheckState.message

  const emailStatus: GdgFieldStatus | undefined =
    `${formData.emailLocal.trim()}@${formData.emailDomain}` === emailCheckState.verifiedValue
      ? 'success'
      : emailCheckState.status === 'error' || emailCheckState.status === 'duplicate'
        ? 'error'
        : undefined
  const emailStatusMessage =
    `${formData.emailLocal.trim()}@${formData.emailDomain}` === emailCheckState.verifiedValue
      ? '※ 가입 가능한 이메일입니다.'
      : emailCheckState.message

  const enrollmentStatus: GdgFieldStatus | undefined =
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
    !isPhoneNumberFormatValid(formData.phoneNumber) ||
    phoneCheckState.status === 'checking' ||
    formData.phoneNumber.trim() === phoneCheckState.verifiedValue
  const isEmailCheckDisabled =
    !formData.emailLocal.trim() ||
    emailCheckState.status === 'checking' ||
    `${formData.emailLocal.trim()}@${formData.emailDomain}` === emailCheckState.verifiedValue

  return (
    <>
      <Loader isLoading={loading} />
      <div className="relative min-h-screen bg-black text-white overflow-x-hidden">
        <form
          onSubmit={handleSubmit}
          className="relative z-10 pt-18 pb-30 mobile:pt-12 mobile:pb-12"
        >
          <div className="layout-grid layout-grid--narrow-screen layout-grid--4 gap-y-8 mobile:gap-y-6">
            <div className="col-span-4 flex items-center gap-3 pb-8 mobile:gap-2 mobile:pb-2">
              <GdgLogo mode="auto" />
              <p className="typo-h3 text-white mobile:typo-m-h3">GDGoC INHA 지원</p>
            </div>

            <div className="col-span-4 pb-2 mobile:typo-m-s3 flex flex-col items-center text-center">
              <div className="pc:contents hidden">
                <GdgButton
                  device="pc"
                  type="button"
                  size="small"
                  variant="active"
                  widthToken="full"
                  onClick={() => router.push('/recruit/member/memo')}
                >
                  신입생 지원 알림 신청 바로가기
                </GdgButton>
                <p className="mt-2 typo-pc-c2 text-gray-400">
                  신입생분들은 학번이 나오지 않아 지금은 지원이 어려워요.
                </p>
              </div>
              <div className="pc:hidden contents">
                <GdgButton
                  device="mobile"
                  type="button"
                  size="small"
                  variant="active"
                  widthToken="full"
                  onClick={() => router.push('/recruit/member/memo')}
                >
                  신입생 지원 알림 신청 바로가기
                </GdgButton>
                <p className="mt-2 typo-m-c1 text-gray-400">
                  신입생분들은 학번이 나오지 않아 지금은 지원이 어려워요.
                </p>
              </div>
            </div>

            <div className="col-span-4 space-y-8 mobile:space-y-6">
              <p className="typo-h5 text-white mobile:typo-m-h4">기본 정보</p>

              <div className="col-span-4 space-y-8 mobile:space-y-6">
                {/* 이름 & 성별 */}
                <div className="flex items-start gap-5 mobile:gap-2">
                  <div className="pc:contents hidden">
                    <GdgFieldContainer label="이름" required>
                      <GdgInputField
                        device="pc"
                        value={formData.name}
                        onChange={(e) => handleValueChange('name')(e.target.value)}
                        placeholder="이름을 입력해 주세요."
                        width="twoThirds"
                      />
                    </GdgFieldContainer>
                  </div>
                  <div className="pc:hidden contents">
                    <GdgFieldContainer label="이름" required>
                      <GdgInputField
                        device="mobile"
                        value={formData.name}
                        onChange={(e) => handleValueChange('name')(e.target.value)}
                        placeholder="이름을 입력해 주세요."
                        width="twoThirds"
                      />
                    </GdgFieldContainer>
                  </div>
                  <GdgFieldContainer label="성별" required>
                    <div className="pc:contents hidden">
                      <GdgDropdown
                        device="pc"
                        size="small"
                        options={genderOptions}
                        value={formData.gender}
                        onChange={handleValueChange('gender')}
                        placeholder="성별"
                      />
                    </div>
                    <div className="pc:hidden contents">
                      <GdgDropdown
                        device="mobile"
                        size="small"
                        options={genderOptions}
                        value={formData.gender}
                        onChange={handleValueChange('gender')}
                        placeholder="성별"
                      />
                    </div>
                  </GdgFieldContainer>
                </div>

                {/* 생년월일 */}
                <GdgFieldContainer label="생년월일" required>
                  <div className="pc:contents hidden">
                    <GdgInputField
                      device="pc"
                      value={formData.birth}
                      onChange={(e) => handleValueChange('birth')(e.target.value)}
                      placeholder="생년월일을 입력해 주세요. (YYYY.MM.DD)"
                      width="full"
                    />
                  </div>
                  <div className="pc:hidden contents">
                    <GdgInputField
                      device="mobile"
                      value={formData.birth}
                      onChange={(e) => handleValueChange('birth')(e.target.value)}
                      placeholder="생년월일을 입력해 주세요. (YYYY.MM.DD)"
                      width="full"
                    />
                  </div>
                </GdgFieldContainer>

                {/* 주전공 */}
                <GdgFieldContainer
                  label="주전공"
                  required
                  caption="검색 또는 스크롤하여 지정하세요."
                >
                  <div className="pc:contents hidden">
                    <GdgMajorDropdown
                      device="pc"
                      value={formData.major}
                      onChangeAction={handleValueChange('major')}
                    />
                  </div>
                  <div className="pc:hidden contents">
                    <GdgMajorDropdown
                      device="mobile"
                      value={formData.major}
                      onChangeAction={handleValueChange('major')}
                    />
                  </div>
                </GdgFieldContainer>

                {/* 재학 상태 */}
                <GdgFieldContainer
                  label="재학 상태"
                  required
                  status={enrollmentStatus}
                  statusMessage={enrollmentStatusMessage}
                >
                  <div className="grid grid-cols-3 gap-4 mobile:gap-2">
                    {enrollmentOptions.map((option) => (
                      <div key={option}>
                        <div className="pc:contents hidden">
                          <GdgButton
                            device="pc"
                            type="button"
                            size="small"
                            variant={
                              formData.enrolledClassification === option ? 'pressed' : 'bordered'
                            }
                            widthToken="oneThird"
                            onClick={() => handleValueChange('enrolledClassification')(option)}
                          >
                            {option}
                          </GdgButton>
                        </div>
                        <div className="pc:hidden contents">
                          <GdgButton
                            device="mobile"
                            type="button"
                            size="small"
                            variant={
                              formData.enrolledClassification === option ? 'pressed' : 'bordered'
                            }
                            widthToken="small"
                            onClick={() => handleValueChange('enrolledClassification')(option)}
                          >
                            {option}
                          </GdgButton>
                        </div>
                      </div>
                    ))}
                  </div>
                </GdgFieldContainer>

                {/* 증빙 서류 */}
                {formData.enrolledClassification === '군휴학' && (
                  <GdgFieldContainer
                    label="증빙 서류 (군 휴학)"
                    required
                    caption="포털에서 군휴학 신청내역 캡쳐"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                    />
                    {!formData.proofFile ? (
                      <div className="contents">
                        <GdgUploadButton
                          device="auto"
                          onClick={() => fileInputRef.current?.click()}
                        />
                      </div>
                    ) : (
                      <div className="contents">
                        <GdgFileCard
                          device="auto"
                          fileName={formData.proofFile.name}
                          fileSize={(formData.proofFile.size / 1024 / 1024).toFixed(2) + ' MB'}
                          onAction={handleFileRemove}
                          fullWidth
                        />
                      </div>
                    )}
                  </GdgFieldContainer>
                )}

                <GdgFieldContainer
                  label="학번"
                  required
                  status={studentStatus}
                  statusMessage={studentStatusMessage}
                  action={
                    <>
                      <div className="pc:contents hidden">
                        <GdgButton
                          device="pc"
                          type="button"
                          onClick={handleStudentCheck}
                          disabled={isStudentCheckDisabled}
                          widthToken="small"
                          size="small"
                          variant={!isStudentCheckDisabled ? 'active' : 'default'}
                        >
                          중복 확인
                        </GdgButton>
                      </div>

                      <div className="pc:hidden contents">
                        <GdgButton
                          device="mobile"
                          type="button"
                          onClick={handleStudentCheck}
                          disabled={isStudentCheckDisabled}
                          size="small"
                          variant={!isStudentCheckDisabled ? 'active' : 'default'}
                        >
                          중복 확인
                        </GdgButton>
                      </div>
                    </>
                  }
                >
                  <>
                    <div className="pc:contents hidden">
                      <GdgInputField
                        device="pc"
                        aria-label="학번"
                        value={formData.studentId}
                        onChange={(e) => handleValueChange('studentId')(e.target.value)}
                        placeholder="학번을 입력해 주세요."
                        width="twoThirds"
                        state={studentStatus === 'error' ? 'error' : 'available'}
                      />
                    </div>

                    <div className="pc:hidden contents">
                      <GdgInputField
                        device="mobile"
                        aria-label="학번"
                        value={formData.studentId}
                        onChange={(e) => handleValueChange('studentId')(e.target.value)}
                        placeholder="학번을 입력해 주세요."
                        width="twoThirds"
                        state={studentStatus === 'error' ? 'error' : 'available'}
                      />
                    </div>
                  </>
                </GdgFieldContainer>

                <GdgFieldContainer
                  label="전화번호"
                  required
                  status={phoneStatus}
                  statusMessage={phoneStatusMessage}
                  action={
                    <>
                      <div className="pc:contents hidden">
                        <GdgButton
                          device="pc"
                          type="button"
                          onClick={handlePhoneCheck}
                          disabled={isPhoneCheckDisabled}
                          widthToken="small"
                          size="small"
                          variant={!isPhoneCheckDisabled ? 'active' : 'default'}
                        >
                          중복 확인
                        </GdgButton>
                      </div>

                      <div className="pc:hidden contents">
                        <GdgButton
                          device="mobile"
                          type="button"
                          onClick={handlePhoneCheck}
                          disabled={isPhoneCheckDisabled}
                          size="small"
                          variant={!isPhoneCheckDisabled ? 'active' : 'default'}
                        >
                          중복 확인
                        </GdgButton>
                      </div>
                    </>
                  }
                >
                  <>
                    <div className="pc:contents hidden">
                      <GdgInputField
                        device="pc"
                        aria-label="전화번호"
                        value={formData.phoneNumber}
                        onChange={(e) => handleValueChange('phoneNumber')(e.target.value)}
                        placeholder="전화번호를 입력해 주세요."
                        width="twoThirds"
                        state={phoneStatus === 'error' ? 'error' : 'available'}
                      />
                    </div>

                    <div className="pc:hidden contents">
                      <GdgInputField
                        device="mobile"
                        aria-label="전화번호"
                        value={formData.phoneNumber}
                        onChange={(e) => handleValueChange('phoneNumber')(e.target.value)}
                        placeholder="전화번호를 입력해 주세요."
                        width="twoThirds"
                        state={phoneStatus === 'error' ? 'error' : 'available'}
                      />
                    </div>
                  </>
                </GdgFieldContainer>

                <GdgFieldContainer
                  label="이메일"
                  required
                  status={emailStatus}
                  statusMessage={emailStatusMessage}
                  action={
                    <>
                      <div className="pc:contents hidden">
                        <GdgButton
                          device="pc"
                          type="button"
                          onClick={handleEmailCheck}
                          disabled={isEmailCheckDisabled}
                          widthToken="small"
                          size="small"
                          variant={!isEmailCheckDisabled ? 'active' : 'default'}
                        >
                          중복 확인
                        </GdgButton>
                      </div>

                      <div className="pc:hidden contents">
                        <GdgButton
                          device="mobile"
                          type="button"
                          onClick={handleEmailCheck}
                          disabled={isEmailCheckDisabled}
                          size="small"
                          variant={!isEmailCheckDisabled ? 'active' : 'default'}
                        >
                          중복 확인
                        </GdgButton>
                      </div>
                    </>
                  }
                >
                  <>
                    <div className="pc:contents hidden">
                      <GdgInputField
                        device="pc"
                        value={formData.emailLocal}
                        onChange={(e) => handleValueChange('emailLocal')(e.target.value)}
                        placeholder="이메일 아이디를 입력해 주세요."
                        width="twoThirds"
                        state={emailStatus === 'error' ? 'error' : 'available'}
                        endAdornment={<span className="typo-pc-b2 text-white mr-1">@inha.edu</span>}
                      />
                    </div>

                    <div className="pc:hidden contents">
                      <GdgInputField
                        device="mobile"
                        value={formData.emailLocal}
                        onChange={(e) => handleValueChange('emailLocal')(e.target.value)}
                        placeholder="이메일 아이디"
                        width="twoThirds"
                        state={emailStatus === 'error' ? 'error' : 'available'}
                        endAdornment={<span className="typo-m-b3 text-white mr-1">@inha.edu</span>}
                      />
                    </div>
                  </>
                </GdgFieldContainer>
              </div>
            </div>

            <div className="col-span-4 space-y-8 mobile:space-y-6 pt-8 mobile:pt-2">
              <p className="typo-h5 mobile:typo-m-h4 text-white">흥미 및 활동 성향</p>
              <GdgFieldContainer label="관심 분야" required>
                <Select
                  selectionMode="multiple"
                  selectedKeys={new Set(formData.gdgInterest)}
                  onChange={(e) =>
                    handleLimitedMultiSelection('gdgInterest', '관심 분야')(e.target.value)
                  }
                  placeholder="최대 3개까지 선택 가능합니다."
                  classNames={recruitMultiSelectClassNames}
                  listboxProps={{ itemClasses: recruitMultiSelectItemClasses }}
                  renderValue={(items) => (
                    <span className="truncate text-white typo-b2 mobile:typo-m-b3">
                      {items.map((i) => String(i.textValue ?? '')).join(', ')}
                    </span>
                  )}
                >
                  {interestDropdownOptions.map((o) => (
                    <SelectItem key={o.id}>{o.label}</SelectItem>
                  ))}
                </Select>
              </GdgFieldContainer>
              <GdgFieldContainer label="하고 싶은 활동" required>
                <Select
                  selectionMode="multiple"
                  selectedKeys={new Set(formData.gdgWish)}
                  onChange={(e) =>
                    handleLimitedMultiSelection('gdgWish', '하고 싶은 활동')(e.target.value)
                  }
                  placeholder="최대 3개까지 선택 가능합니다."
                  classNames={recruitMultiSelectClassNames}
                  listboxProps={{ itemClasses: recruitMultiSelectItemClasses }}
                  renderValue={(items) => (
                    <span className="truncate text-white typo-b2 mobile:typo-m-b3">
                      {items.map((i) => String(i.textValue ?? '')).join(', ')}
                    </span>
                  )}
                >
                  {wishDropdownOptions.map((o) => (
                    <SelectItem key={o.id}>{o.label}</SelectItem>
                  ))}
                </Select>
              </GdgFieldContainer>
              <GdgFieldContainer label="동아리 운영에 바라는 점">
                <GdgTextarea
                  value={formData.gdgFeedback}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, gdgFeedback: e.target.value.slice(0, 100) }))
                  }
                  maxLength={100}
                  placeholder="내용을 입력해 주세요."
                  fullWidth
                />
              </GdgFieldContainer>

              <div className="space-y-4">
                <PrivacyPolicyNotice target="member" compact />
                <div className="flex items-center justify-end gap-2">
                  <p className="typo-pc-b3 mobile:typo-m-c1 text-white text-right">
                    <span className="text-red typo-pc-b3 mobile:typo-m-c1">* </span>개인정보
                    처리방침에 동의합니다.
                  </p>
                  <GdgCheckbox
                    size="mobile"
                    checked={formData.isPayed}
                    onCheckedChange={(c) => setFormData((p) => ({ ...p, isPayed: c }))}
                  />
                </div>
              </div>
            </div>

            <div className="col-span-4 flex justify-end pt-8 mobile:grid mobile:grid-cols-3 mobile:gap-2">
              <div className="hidden mobile:block" aria-hidden />
              <div className="hidden mobile:block" aria-hidden />
              <div className="pc:contents hidden">
                <GdgButton
                  device="pc"
                  type="submit"
                  disabled={!isFormValid || loading}
                  widthToken="small"
                  size="large"
                  variant={isFormValid ? 'active' : 'disabled'}
                >
                  제출하기
                </GdgButton>
              </div>
              <div className="pc:hidden contents">
                <GdgButton
                  device="mobile"
                  type="submit"
                  disabled={!isFormValid || loading}
                  widthToken="small"
                  size="large"
                  variant={isFormValid ? 'active' : 'disabled'}
                  fullWidth
                >
                  제출하기
                </GdgButton>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  )
}
