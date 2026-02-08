'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Select, SelectItem } from '@nextui-org/react'
import axios from 'axios'

import Loader from '@/components/ui/common/Loader'
import {
  GdgCheckbox,
  GdgDropdown,
  GdgFieldContainer,
  GdgLogo,
  GdgMajorDropdown
} from '@/components/ui/design-system'
import { interestOptions } from '@/constant/interestOptions'
import { wishOptions } from '@/constant/wishOptions'
import { formatRecruitData } from '@/utils/formatRecruitData'
import { GdgInput } from '@/components/ui/input/GdgInput'
import { formatPhoneNumberInput, isPhoneNumberFormatValid } from '@/utils/phoneNumber'

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
}

type DuplicateStatus = 'idle' | 'valid' | 'invalid' | 'pending'

const initialFormState: RecruitFormState = {
  privacyAgreement: false,
  name: '',
  gender: '',
  birth: '',
  major: '',
  enrolledClassification: '',
  grade: '',
  studentId: '',
  phoneNumber: '',
  nationality: '',
  emailLocal: '',
  emailDomain: 'inha.edu',
  gdgInterest: [],
  gdgWish: [],
  gdgPeriod: [],
  gdgRoute: '',
  gdgRouteEtc: '',
  gdgExpect: [],
  gdgFeedback: '',
  isPayed: false
}

const enrollmentOptions = ['재학', '부분등록', '휴학', '군휴학', '수료', '졸업']
const genderOptions = [
  { id: 'male', label: '남성' },
  { id: 'female', label: '여성' },
  { id: 'hidden', label: '비공개' }
]

const inputClassNames = {
  inputWrapper: [
    'h-11',
    'rounded-full',
    'px-4',
    'bg-black',
    'border',
    'border-gray-800',
    'transition-colors',
    'group-data-[hover=true]:border-gray-900',
    'group-data-[focus=true]:border-white',
    'group-data-[has-value=true]:border-white',
    'group-data-[invalid=true]:border-red',
    'group-data-[disabled=true]:bg-gray-400',
    'group-data-[disabled=true]:border-gray-400',
    'group-data-[disabled=true]:opacity-60'
  ].join(' '),
  input: [
    'text-white',
    'placeholder:text-gray-700',
    'placeholder:font-medium',
    'placeholder:opacity-100',
    'group-data-[focus=true]:placeholder:text-transparent',
    'typo-b2',
    'mobile:typo-m-b3'
  ].join(' '),
  helperWrapper: 'pl-2 pt-2',
  errorMessage: 'typo-c2 text-red'
}

const recruitMultiSelectClassNames = {
  trigger:
    'h-11 rounded-full bg-black border border-gray-800 px-4 data-[hover=true]:border-gray-900 data-[open=true]:border-white',
  value: 'text-white typo-b2 mobile:typo-m-b3',
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
    'data-[selected=true]:bg-white data-[selected=true]:text-black',
    '[&[data-selected=true][data-hover=true]]:bg-white [&[data-selected=true][data-hover=true]]:text-black',
    '[&_[data-slot=selected-icon]]:text-black'
  ].join(' '),
  title: 'font-medium'
}

export default function Recruit() {
  const router = useRouter()
  const [formData, setFormData] = useState<RecruitFormState>(initialFormState)
  const [loading, setLoading] = useState(false)
  const [studentIdStatus, setStudentIdStatus] = useState<DuplicateStatus>('idle')
  const [phoneStatus, setPhoneStatus] = useState<DuplicateStatus>('idle')
  const [verifiedStudentId, setVerifiedStudentId] = useState('')
  const [verifiedPhoneNumber, setVerifiedPhoneNumber] = useState('')

  const interestDropdownOptions = useMemo(
    () => interestOptions.map((option) => ({ id: option, label: option })),
    []
  )
  const wishDropdownOptions = useMemo(
    () => wishOptions.map((option) => ({ id: option, label: option })),
    []
  )

  const handleValueChange = (field: keyof RecruitFormState) => (value: string) => {
    const nextValue = field === 'phoneNumber' ? formatPhoneNumberInput(value) : value
    setFormData((prev) => ({ ...prev, [field]: nextValue }))

    if (field === 'studentId') {
      const trimmed = nextValue.trim()
      setStudentIdStatus(trimmed && verifiedStudentId === trimmed ? 'valid' : 'idle')
    }

    if (field === 'phoneNumber') {
      const trimmed = nextValue.trim()
      setPhoneStatus(trimmed && verifiedPhoneNumber === trimmed ? 'valid' : 'idle')
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

  const handleStudentIdCheck = async () => {
    if (!formData.studentId || formData.studentId.length !== 8) {
      alert('8자리 학번을 입력해 주세요.')
      return
    }

    setStudentIdStatus('pending')

    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_API_URL}/check/student-id`, {
        params: { studentId: formData.studentId }
      })

      const isExists = response.data?.data?.isExists
      if (isExists) {
        setStudentIdStatus('invalid')
        return
      }

      setVerifiedStudentId(formData.studentId.trim())
      setStudentIdStatus('valid')
    } catch (error) {
      console.error('학번 중복 확인 중 오류가 발생했습니다.', error)
      setStudentIdStatus('invalid')
    }
  }

  const handlePhoneCheck = async () => {
    if (!formData.phoneNumber.trim()) {
      alert('전화번호를 입력해 주세요.')
      return
    }

    if (!isPhoneNumberFormatValid(formData.phoneNumber)) {
      alert('010-1234-5678 형식으로 입력해 주세요.')
      return
    }

    setPhoneStatus('pending')

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/check/phone-number`,
        {
          params: { phoneNumber: formData.phoneNumber }
        }
      )

      const isExists = response.data?.data?.isExists
      if (isExists) {
        setPhoneStatus('invalid')
        return
      }

      setVerifiedPhoneNumber(formData.phoneNumber.trim())
      setPhoneStatus('valid')
    } catch (error) {
      console.error('전화번호 중복 확인 중 오류가 발생했습니다.', error)
      setPhoneStatus('invalid')
    }
  }

  const isFormValid = useMemo(() => {
    const requiredStringFields: (keyof RecruitFormState)[] = [
      'name',
      'gender',
      'birth',
      'major',
      'enrolledClassification',
      'studentId',
      'phoneNumber',
      'emailLocal',
      'gdgFeedback'
    ]

    const hasRequiredStrings = requiredStringFields.every(
      (field) => formData[field].toString().trim() !== ''
    )

    return (
      hasRequiredStrings &&
      formData.gdgInterest.length > 0 &&
      formData.gdgWish.length > 0 &&
      studentIdStatus === 'valid' &&
      phoneStatus === 'valid' &&
      formData.isPayed
    )
  }, [formData, phoneStatus, studentIdStatus])

  const buildRecruitMap = () => {
    const normalizedEmail =
      formData.emailLocal && formData.emailDomain
        ? `${formData.emailLocal}@${formData.emailDomain}`
        : formData.emailLocal

    const map = new Map<number, Record<string, unknown>>()

    map.set(1, { isAgree: formData.isPayed })
    map.set(2, {
      name: formData.name,
      studentId: formData.studentId,
      enrolledClassification: formData.enrolledClassification
    })
    map.set(3, {
      grade: formData.grade,
      phoneNumber: formData.phoneNumber,
      nationality: formData.nationality
    })
    map.set(4, { gender: formData.gender, birth: formData.birth, email: normalizedEmail })
    map.set(5, { major: formData.major })
    map.set(6, { gdgUserMotive: '' })
    map.set(7, { gdgUserStory: '' })
    map.set(8, {
      gdgInterest: formData.gdgInterest,
      gdgPeriod: formData.gdgPeriod,
      gdgRoute: formData.gdgRoute === '기타' ? formData.gdgRouteEtc : formData.gdgRoute
    })
    map.set(9, { gdgExpect: formData.gdgExpect, gdgWish: formData.gdgWish })
    map.set(10, { gdgFeedback: formData.gdgFeedback })
    map.set(11, { isPayed: formData.isPayed })

    return map
  }

  const handleSubmit = async () => {
    if (!isFormValid) {
      alert('필수 항목을 모두 입력해 주세요.')
      return
    }

    if (!window.confirm('입력하신 정보로 지원서를 제출하시겠습니까?')) return

    const formattedData = formatRecruitData(buildRecruitMap())

    try {
      setLoading(true)
      await axios.post(`${process.env.NEXT_PUBLIC_BASE_API_URL}/apply`, formattedData)
      router.push('/recruit/submit')
    } catch (error: any) {
      console.error('지원서 제출 중 오류가 발생했습니다.', error)

      if (error?.response?.status === 500) {
        alert('이미 지원이 완료된 회원입니다.')
      } else {
        alert('지원서 제출 중 문제가 발생했습니다. 다시 시도해 주세요.')
      }
    } finally {
      setLoading(false)
    }
  }

  const studentStatusMessage =
    studentIdStatus === 'valid'
      ? '※ 가입 가능한 학번입니다.'
      : studentIdStatus === 'invalid'
        ? '※ 중복된 학번입니다.'
        : studentIdStatus === 'pending'
          ? '※ 확인 중입니다.'
          : undefined

  const phoneStatusMessage =
    phoneStatus === 'valid'
      ? '※ 가입 가능한 전화번호입니다.'
      : phoneStatus === 'invalid'
        ? '※ 중복된 전화번호입니다.'
        : phoneStatus === 'pending'
          ? '※ 확인 중입니다.'
          : undefined

  const isStudentCheckDisabled =
    !formData.studentId.trim() ||
    formData.studentId.trim().length !== 8 ||
    studentIdStatus === 'pending' ||
    (studentIdStatus === 'valid' && verifiedStudentId === formData.studentId.trim())

  const isPhoneCheckDisabled =
    !formData.phoneNumber.trim() ||
    !isPhoneNumberFormatValid(formData.phoneNumber) ||
    phoneStatus === 'pending' ||
    (phoneStatus === 'valid' && verifiedPhoneNumber === formData.phoneNumber.trim())

  return (
    <>
      <Loader isLoading={loading} />
      <div className="relative min-h-screen bg-black text-white">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            void handleSubmit()
          }}
          className="relative z-10 pt-18 pb-30 mobile:pt-12 mobile:pb-12"
        >
          <div className="px-6 mobile:px-4">
            <div className="layout-grid layout-grid--narrow-screen layout-grid--4 gap-y-8 mobile:gap-y-6">
              <div className="col-span-4 flex items-center gap-3 pb-8 mobile:gap-2 mobile:pb-2">
                <GdgLogo mode="auto" />
                <p className="typo-h3 text-white mobile:typo-m-h3">
                  <span className="hidden pc:inline">GDGoC Inha Univ. 지원</span>
                  <span className="inline pc:hidden">Core Member 지원</span>
                </p>
              </div>

              <div className="col-span-4 space-y-8 mobile:space-y-6">
                <p className="typo-h5 text-white mobile:typo-m-h4">기본 정보</p>

                <div className="flex items-start gap-5 mobile:gap-2">
                  <div className="pc:w-102 mobile:w-56.5">
                    <GdgFieldContainer label="이름" required>
                      <GdgInput
                        aria-label="이름"
                        value={formData.name}
                        onValueChange={handleValueChange('name')}
                        placeholder="이름을 입력하세요."
                        classNames={inputClassNames}
                      />
                    </GdgFieldContainer>
                  </div>

                  <div className="pc:w-30.5 mobile:w-27.25">
                    <GdgFieldContainer label="성별" required>
                      <GdgDropdown
                        device="pc"
                        size="small"
                        options={genderOptions}
                        value={formData.gender}
                        onChange={handleValueChange('gender')}
                        placeholder="성별"
                      />
                    </GdgFieldContainer>
                  </div>
                </div>

                <GdgFieldContainer label="생년월일" required>
                  <GdgInput
                    aria-label="생년월일"
                    type="date"
                    value={formData.birth}
                    onValueChange={handleValueChange('birth')}
                    placeholder="YYYY.MM.DD"
                    classNames={{
                      ...inputClassNames,
                      input: [
                        inputClassNames.input,
                        '[color-scheme:dark]',
                        '[&::-webkit-calendar-picker-indicator]:opacity-0',
                        '[&::-webkit-calendar-picker-indicator]:pointer-events-none'
                      ].join(' ')
                    }}
                    endContent={
                      <button
                        type="button"
                        aria-label="생년월일 선택"
                        onClick={(event) => {
                          const input = event.currentTarget
                            .closest('label')
                            ?.querySelector('input') as HTMLInputElement | null
                          if (!input) return
                          input.focus()
                          input.showPicker?.()
                        }}
                        className="inline-flex items-center justify-center"
                      >
                        <svg
                          aria-hidden
                          viewBox="0 0 20 20"
                          className="size-5 text-gray-700"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect
                            x="3.25"
                            y="4.25"
                            width="13.5"
                            height="12.5"
                            rx="1.75"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                          <path
                            d="M6.5 2.75V5.25"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                          <path
                            d="M13.5 2.75V5.25"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                          <path d="M3.5 7.25H16.5" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                      </button>
                    }
                  />
                </GdgFieldContainer>

                <GdgFieldContainer
                  label="주전공"
                  required
                  caption="검색 혹은 스크롤하여 지정하세요."
                >
                  <div className="hidden pc:block">
                    <GdgMajorDropdown
                      device="pc"
                      value={formData.major}
                      onChangeAction={handleValueChange('major')}
                    />
                  </div>
                  <div className="block pc:hidden">
                    <GdgMajorDropdown
                      device="mobile"
                      value={formData.major}
                      onChangeAction={handleValueChange('major')}
                    />
                  </div>
                </GdgFieldContainer>

                <GdgFieldContainer label="재학 상태" required>
                  <div className="grid grid-cols-3 gap-5 mobile:gap-2">
                    {enrollmentOptions.map((option) => {
                      const selected = formData.enrolledClassification === option

                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              enrolledClassification:
                                prev.enrolledClassification === option ? '' : option
                            }))
                          }
                          className={[
                            'h-11 rounded-full border typo-b2 mobile:typo-m-b3 transition-colors',
                            selected
                              ? 'border-red bg-red-400 text-white'
                              : 'border-gray-800 bg-black text-white'
                          ].join(' ')}
                        >
                          {option}
                        </button>
                      )
                    })}
                  </div>
                </GdgFieldContainer>

                <GdgFieldContainer
                  label="학번"
                  required
                  status={
                    studentIdStatus === 'valid'
                      ? 'success'
                      : studentIdStatus === 'invalid'
                        ? 'error'
                        : undefined
                  }
                  statusMessage={studentStatusMessage}
                >
                  <div className="flex items-center gap-5 mobile:gap-2">
                    <div className="pc:w-102 mobile:w-56.5">
                      <GdgInput
                        aria-label="학번"
                        value={formData.studentId}
                        onValueChange={handleValueChange('studentId')}
                        placeholder="학번을 입력하세요."
                        classNames={inputClassNames}
                      />
                    </div>
                    <Button
                      type="button"
                      onPress={handleStudentIdCheck}
                      isDisabled={isStudentCheckDisabled}
                      className="h-11 min-w-0 pc:w-30.5 mobile:w-27.25 rounded-full bg-red typo-b2 text-white mobile:typo-m-b3 disabled:bg-gray-400 disabled:text-white/70"
                    >
                      {studentIdStatus === 'pending' ? '확인 중' : '중복 확인'}
                    </Button>
                  </div>
                </GdgFieldContainer>

                <GdgFieldContainer
                  label="전화번호"
                  required
                  status={
                    phoneStatus === 'valid'
                      ? 'success'
                      : phoneStatus === 'invalid'
                        ? 'error'
                        : undefined
                  }
                  statusMessage={phoneStatusMessage}
                >
                  <div className="flex items-center gap-5 mobile:gap-2">
                    <div className="pc:w-102 mobile:w-56.5">
                      <GdgInput
                        aria-label="전화번호"
                        value={formData.phoneNumber}
                        onValueChange={handleValueChange('phoneNumber')}
                        placeholder="전화번호를 입력하세요."
                        classNames={inputClassNames}
                      />
                    </div>
                    <Button
                      type="button"
                      onPress={handlePhoneCheck}
                      isDisabled={isPhoneCheckDisabled}
                      className="h-11 min-w-0 pc:w-30.5 mobile:w-27.25 rounded-full bg-red typo-b2 text-white mobile:typo-m-b3 disabled:bg-gray-400 disabled:text-white/70"
                    >
                      {phoneStatus === 'pending' ? '확인 중' : '중복 확인'}
                    </Button>
                  </div>
                </GdgFieldContainer>

                <GdgFieldContainer label="이메일" required>
                  <div className="flex items-center gap-5 mobile:gap-2">
                    <div className="flex min-w-0 flex-1 items-center gap-2 mobile:gap-1">
                      <div className="min-w-0 flex-1">
                        <GdgInput
                          aria-label="이메일"
                          value={formData.emailLocal}
                          onValueChange={handleValueChange('emailLocal')}
                          placeholder="이메일"
                          classNames={inputClassNames}
                        />
                      </div>
                      <span className="typo-b2 text-white mobile:typo-m-b3">@</span>
                      <div className="h-11 rounded-full bg-gray-400 px-4 inline-flex items-center typo-b2 text-gray-900 mobile:typo-m-b3">
                        {formData.emailDomain}
                      </div>
                    </div>
                    <Button
                      type="button"
                      isDisabled={!formData.emailLocal.trim()}
                      className="h-11 min-w-0 pc:w-30.5 mobile:w-27.25 rounded-full bg-red typo-b2 text-white mobile:typo-m-b3 disabled:bg-gray-400 disabled:text-white/70"
                    >
                      중복 확인
                    </Button>
                  </div>
                </GdgFieldContainer>
              </div>

              <div className="col-span-4 space-y-8 mobile:space-y-6 pt-8 mobile:pt-2">
                <div className="space-y-4 mobile:space-y-3">
                  <p className="typo-h5 text-white mobile:typo-m-h4">흥미 및 활동 성향</p>
                  <div className="rounded-xl bg-gray-100 px-4 py-3 mobile:px-3">
                    <p className="typo-c1 text-white">
                      • 본 섹션은 선발 목적이 아니라 활동 구성 및 커뮤니티 운영 참고용 데이터로
                      활용됩니다.
                    </p>
                  </div>
                </div>

                <GdgFieldContainer label="관심 분야">
                  <Select
                    aria-label="관심 분야"
                    selectionMode="multiple"
                    selectedKeys={new Set(formData.gdgInterest)}
                    onChange={(event) =>
                      handleLimitedMultiSelection('gdgInterest', '관심 분야')(event.target.value)
                    }
                    placeholder="최대 3개까지 선택 가능합니다."
                    className="w-full"
                    classNames={recruitMultiSelectClassNames}
                    listboxProps={{
                      itemClasses: recruitMultiSelectItemClasses
                    }}
                    renderValue={(items) => {
                      const labels = items
                        .map((item) => String(item.textValue ?? ''))
                        .filter(Boolean)
                        .join(', ')

                      return (
                        <span className="truncate text-white typo-b2 mobile:typo-m-b3">
                          {labels || '최대 3개까지 선택 가능합니다.'}
                        </span>
                      )
                    }}
                  >
                    {interestDropdownOptions.map((option) => (
                      <SelectItem key={option.id}>{option.label}</SelectItem>
                    ))}
                  </Select>
                </GdgFieldContainer>

                <GdgFieldContainer label="하고 싶은 활동">
                  <Select
                    aria-label="하고 싶은 활동"
                    selectionMode="multiple"
                    selectedKeys={new Set(formData.gdgWish)}
                    onChange={(event) =>
                      handleLimitedMultiSelection('gdgWish', '하고 싶은 활동')(event.target.value)
                    }
                    placeholder="최대 3개까지 선택 가능합니다."
                    className="w-full"
                    classNames={recruitMultiSelectClassNames}
                    listboxProps={{
                      itemClasses: recruitMultiSelectItemClasses
                    }}
                    renderValue={(items) => {
                      const labels = items
                        .map((item) => String(item.textValue ?? ''))
                        .filter(Boolean)
                        .join(', ')

                      return (
                        <span className="truncate text-white typo-b2 mobile:typo-m-b3">
                          {labels || '최대 3개까지 선택 가능합니다.'}
                        </span>
                      )
                    }}
                  >
                    {wishDropdownOptions.map((option) => (
                      <SelectItem key={option.id}>{option.label}</SelectItem>
                    ))}
                  </Select>
                </GdgFieldContainer>

                <div className="space-y-2">
                  <div className="flex items-center gap-1 pl-2">
                    <p className="typo-s3 text-white">동아리 운영에 바라는 점</p>
                  </div>
                  <label className="relative block">
                    <textarea
                      value={formData.gdgFeedback}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          gdgFeedback: event.target.value.slice(0, 500)
                        }))
                      }
                      maxLength={500}
                      placeholder="내용을 입력하세요."
                      className="h-45 w-full resize-none rounded-xl border border-gray-800 bg-black px-4 py-3 typo-b2 text-white placeholder:text-gray-700 outline-none transition-colors focus:border-white mobile:h-40 mobile:typo-m-b3"
                    />
                    <p className="absolute bottom-3 right-4 typo-c1 text-gray-700">
                      ({formData.gdgFeedback.length}/500)
                    </p>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pr-2 mobile:pr-0">
                  <p className="typo-c1 text-white text-right">
                    <span className="text-red">* </span>
                    입력한 모든 정보는 동아리 운영을 위한 목적으로만 사용됩니다.
                  </p>
                  <GdgCheckbox
                    size="mobile"
                    checked={formData.isPayed}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, isPayed: checked }))
                    }
                  />
                </div>
              </div>

              <div className="col-span-4 flex justify-end pt-8 mobile:pt-4">
                <Button
                  type="submit"
                  isDisabled={!isFormValid || loading}
                  className="h-11 min-w-0 pc:w-30.5 mobile:w-27.25 rounded-full bg-red typo-b2 text-white mobile:typo-m-b3 disabled:bg-gray-400 disabled:text-white/70"
                >
                  제출하기
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  )
}
