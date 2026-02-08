'use client'

import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { Button } from '@nextui-org/react'
import { useRouter, useSearchParams } from 'next/navigation'

import { GdgInput } from '@/components/ui/input/GdgInput'
import { GdgMajorDropdown } from '@/components/ui/design-system/GdgMajorDropdown'
import { GdgFieldContainer, GdgLogo, type GdgFieldStatus } from '@/components/ui/design-system'
import Loader from '@/components/ui/common/Loader'
import { useAuth } from '@/hooks/useAuth'
import {
  checkPhoneNumberDuplicated,
  checkStudentIdDuplicated,
  type DuplicateCheckResponseBody,
  type SignupResponseBody,
  signupWithProfile
} from '@/services/auth/authClient'
import { PENDING_SIGNUP_STORAGE_KEY, type PendingSignupPayload } from '@/constant/auth'
import { unwrapApiResponse } from '@/utils/api/unwrap'
import { cn } from '@/utils/cn'
import {
  formatPhoneNumberInput,
  isPhoneNumberFormatValid,
  toPhoneDigits
} from '@/utils/phoneNumber'

const DEFAULT_FALLBACK_ROUTE = '/main'
const STUDENT_ID_PATTERN = /^12\d{6}$/

const getSafeNextUrl = (raw: string | null): string => {
  if (!raw) return DEFAULT_FALLBACK_ROUTE

  try {
    const decoded = decodeURIComponent(raw)
    return decoded.startsWith('/') ? decoded : DEFAULT_FALLBACK_ROUTE
  } catch {
    return DEFAULT_FALLBACK_ROUTE
  }
}

interface FieldErrors {
  name?: string
  studentId?: string
  phoneNumber?: string
  major?: string
}

type DuplicateCheckStatus = 'idle' | 'checking' | 'available' | 'duplicate' | 'unverified' | 'error'

interface DuplicateCheckState {
  status: DuplicateCheckStatus
  message?: string
  checkedValue?: string
  verifiedValue?: string
}

const signupInputClassNames = {
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
    'group-data-[disabled=true]:bg-gray-300',
    'group-data-[disabled=true]:border-gray-500',
    'group-data-[disabled=true]:opacity-60'
  ].join(' '),
  input: [
    'typo-b2',
    'mobile:typo-m-b3',
    'text-white',
    'placeholder:text-gray-700',
    'placeholder:font-medium',
    'placeholder:opacity-100',
    'group-data-[focus=true]:placeholder:text-transparent'
  ].join(' '),
  helperWrapper: 'pl-2 pt-2',
  errorMessage: 'typo-c2 text-red'
}

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser } = useAuth()
  const isPreview = searchParams?.get('preview') === '1'

  const [pendingInfo, setPendingInfo] = useState<PendingSignupPayload | null>(null)
  const [initializing, setInitializing] = useState(true)
  const [name, setName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [major, setMajor] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [studentCheckState, setStudentCheckState] = useState<DuplicateCheckState>({
    status: 'idle'
  })
  const [phoneCheckState, setPhoneCheckState] = useState<DuplicateCheckState>({
    status: 'idle'
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const raw = sessionStorage.getItem(PENDING_SIGNUP_STORAGE_KEY)
    if (!raw) {
      if (isPreview) {
        const previewPayload: PendingSignupPayload = {
          oauthSubject: 'preview',
          email: 'preview@gdgoc.dev',
          name: '홍길동',
          next: DEFAULT_FALLBACK_ROUTE
        }
        setPendingInfo(previewPayload)
        setName(previewPayload.name)
        setInitializing(false)
        return
      }
      router.replace('/login')
      setInitializing(false)
      return
    }

    try {
      const parsed = JSON.parse(raw) as PendingSignupPayload
      setPendingInfo(parsed)
      setName(parsed.name ?? '')
    } catch {
      if (isPreview) {
        const previewPayload: PendingSignupPayload = {
          oauthSubject: 'preview',
          email: 'preview@gdgoc.dev',
          name: '홍길동',
          next: DEFAULT_FALLBACK_ROUTE
        }
        setPendingInfo(previewPayload)
        setName(previewPayload.name)
      } else {
        router.replace('/login')
      }
    } finally {
      setInitializing(false)
    }
  }, [router, isPreview])

  useEffect(() => {
    if (!initializing && !pendingInfo && !isPreview) {
      router.replace('/login')
    }
  }, [initializing, pendingInfo, isPreview, router])

  const requestedNext = pendingInfo?.next ?? searchParams?.get('next') ?? null
  const nextUrl = useMemo(() => getSafeNextUrl(requestedNext), [requestedNext])

  const phoneDigits = toPhoneDigits(phoneNumber)
  const handleStudentIdChange = useCallback(
    (value: string) => {
      const nextValue = value.replace(/\D/g, '').slice(0, 8)
      setStudentId(nextValue)
      setFieldErrors((prev) => ({ ...prev, studentId: undefined }))

      if (studentCheckState.verifiedValue === nextValue) {
        setStudentCheckState((prev) => ({
          ...prev,
          status: 'available',
          message: '※ 가입 가능한 학번입니다.',
          checkedValue: nextValue
        }))
        return
      }

      if (studentCheckState.checkedValue !== nextValue) {
        setStudentCheckState((prev) => ({ status: 'idle', verifiedValue: prev.verifiedValue }))
      }
    },
    [studentCheckState.checkedValue, studentCheckState.verifiedValue]
  )

  const handlePhoneNumberChange = useCallback(
    (value: string) => {
      const nextValue = formatPhoneNumberInput(value)
      setPhoneNumber(nextValue)
      setFieldErrors((prev) => ({ ...prev, phoneNumber: undefined }))

      if (phoneCheckState.verifiedValue === nextValue) {
        setPhoneCheckState((prev) => ({
          ...prev,
          status: 'available',
          message: '※ 가입 가능한 전화번호입니다.',
          checkedValue: nextValue
        }))
        return
      }

      if (phoneCheckState.checkedValue !== nextValue) {
        setPhoneCheckState((prev) => ({ status: 'idle', verifiedValue: prev.verifiedValue }))
      }
    },
    [phoneCheckState.checkedValue, phoneCheckState.verifiedValue]
  )

  const handleMajorChange = useCallback((nextMajor: string) => {
    setMajor(nextMajor)
    setFieldErrors((prev) => ({ ...prev, major: undefined }))
  }, [])

  const handleStudentCheck = useCallback(async () => {
    const candidate = studentId.trim()

    if (!candidate) {
      setFieldErrors((prev) => ({ ...prev, studentId: '학번을 입력해주세요.' }))
      setStudentCheckState({ status: 'idle' })
      return
    }

    if (!STUDENT_ID_PATTERN.test(candidate)) {
      setFieldErrors((prev) => ({ ...prev, studentId: '8자리 학번을 입력해주세요.' }))
      setStudentCheckState({ status: 'error', message: '※ 올바른 학번 형식을 입력해 주세요.' })
      return
    }

    setFieldErrors((prev) => ({ ...prev, studentId: undefined }))
    setStudentCheckState({ status: 'checking', checkedValue: candidate })

    try {
      const response = await checkStudentIdDuplicated(candidate)
      const data = unwrapApiResponse<DuplicateCheckResponseBody>(response.data)
      if (data?.isExists) {
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
    } catch (error) {
      const message =
        axios.isAxiosError(error) && typeof error.response?.data?.message === 'string'
          ? error.response.data.message
          : '※ 중복 확인 중 오류가 발생했습니다.'

      setStudentCheckState({
        status: 'error',
        message: `※ ${message}`,
        checkedValue: candidate
      })
    }
  }, [studentId])

  const handlePhoneCheck = useCallback(async () => {
    const candidate = phoneNumber.trim()

    if (!candidate) {
      setFieldErrors((prev) => ({ ...prev, phoneNumber: '전화번호를 입력해주세요.' }))
      setPhoneCheckState({ status: 'idle' })
      return
    }

    if (!isPhoneNumberFormatValid(candidate)) {
      setFieldErrors((prev) => ({ ...prev, phoneNumber: '010-1234-5678 형식으로 입력해주세요.' }))
      setPhoneCheckState({ status: 'error', message: '※ 올바른 전화번호 형식을 입력해 주세요.' })
      return
    }

    setFieldErrors((prev) => ({ ...prev, phoneNumber: undefined }))
    setPhoneCheckState({ status: 'checking', checkedValue: candidate })

    try {
      const response = await checkPhoneNumberDuplicated(candidate)
      const data = unwrapApiResponse<DuplicateCheckResponseBody>(response.data)
      if (data?.isExists) {
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
    } catch (error) {
      const message =
        axios.isAxiosError(error) && typeof error.response?.data?.message === 'string'
          ? error.response.data.message
          : '※ 중복 확인 중 오류가 발생했습니다.'

      setPhoneCheckState({
        status: 'error',
        message: `※ ${message}`,
        checkedValue: candidate
      })
    }
  }, [phoneNumber])

  const validateFields = (): boolean => {
    const errors: FieldErrors = {}
    if (!name.trim()) {
      errors.name = '이름을 입력해주세요.'
    }
    if (!studentId.trim()) {
      errors.studentId = '학번을 입력해주세요.'
    } else if (!/^\d{8}$/.test(studentId.trim())) {
      errors.studentId = '8자리 학번을 입력해주세요.'
    }
    if (!phoneDigits) {
      errors.phoneNumber = '전화번호를 입력해주세요.'
    } else if (!isPhoneNumberFormatValid(phoneNumber.trim())) {
      errors.phoneNumber = '010-1234-5678 형식으로 입력해주세요.'
    }
    if (!major) {
      errors.major = '전공을 선택해주세요.'
    }

    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return false

    const currentStudentId = studentId.trim()
    const currentPhoneNumber = phoneNumber.trim()

    const isStudentChecked =
      studentCheckState.status === 'available' && studentCheckState.checkedValue === currentStudentId
    const isPhoneChecked =
      phoneCheckState.status === 'available' && phoneCheckState.checkedValue === currentPhoneNumber

    if (!isStudentChecked) {
      if (studentCheckState.status !== 'duplicate') {
        setStudentCheckState({
          status: 'unverified',
          message: '※ 중복 확인을 진행해 주세요.',
          checkedValue: currentStudentId
        })
      }
    }

    if (!isPhoneChecked) {
      if (phoneCheckState.status !== 'duplicate') {
        setPhoneCheckState({
          status: 'unverified',
          message: '※ 중복 확인을 진행해 주세요.',
          checkedValue: currentPhoneNumber
        })
      }
    }

    return isStudentChecked && isPhoneChecked
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isPreview) {
      setGlobalError('미리보기 모드에서는 제출할 수 없습니다.')
      return
    }
    if (!pendingInfo) {
      setGlobalError('로그인 정보가 만료되었습니다. 다시 로그인해주세요.')
      router.replace('/login')
      return
    }

    setGlobalError(null)
    setFieldErrors({})

    if (!validateFields()) {
      return
    }

    setLoading(true)

    try {
      const response = await signupWithProfile({
        oauthSubject: pendingInfo.oauthSubject,
        email: pendingInfo.email,
        name: name.trim(),
        studentId: studentId.trim(),
        phoneNumber: phoneDigits,
        major
      })

      const data = unwrapApiResponse<SignupResponseBody>(response.data)
      if (data?.user) {
        setUser(data.user)
      }

      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(PENDING_SIGNUP_STORAGE_KEY)
      }

      router.replace(nextUrl)
    } catch (error) {
      let message = '회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      if (axios.isAxiosError(error)) {
        message =
          (error.response?.data as { message?: string })?.message ?? error.message ?? message
      } else if (error instanceof Error) {
        message = error.message
      }
      setGlobalError(message)
    } finally {
      setLoading(false)
    }
  }

  const studentHasCheckError =
    studentCheckState.status === 'duplicate' ||
    studentCheckState.status === 'unverified' ||
    studentCheckState.status === 'error'
  const phoneHasCheckError =
    phoneCheckState.status === 'duplicate' ||
    phoneCheckState.status === 'unverified' ||
    phoneCheckState.status === 'error'
  const isStudentCheckDisabled =
    !studentId.trim() ||
    !STUDENT_ID_PATTERN.test(studentId.trim()) ||
    studentCheckState.status === 'checking' ||
    (studentCheckState.status === 'available' && studentCheckState.checkedValue === studentId.trim())
  const isPhoneCheckDisabled =
    !phoneNumber.trim() ||
    !isPhoneNumberFormatValid(phoneNumber) ||
    phoneCheckState.status === 'checking' ||
    (phoneCheckState.status === 'available' && phoneCheckState.checkedValue === phoneNumber.trim())
  const isStudentIdValid = STUDENT_ID_PATTERN.test(studentId.trim())
  const isPhoneNumberValid = isPhoneNumberFormatValid(phoneNumber.trim())
  const isStudentCheckedAvailable =
    studentCheckState.status === 'available' && studentCheckState.checkedValue === studentId.trim()
  const isPhoneCheckedAvailable =
    phoneCheckState.status === 'available' && phoneCheckState.checkedValue === phoneNumber.trim()
  const isSignupReady =
    Boolean(name.trim()) &&
    Boolean(major) &&
    isStudentIdValid &&
    isPhoneNumberValid &&
    isStudentCheckedAvailable &&
    isPhoneCheckedAvailable

  const studentStatusMessage = fieldErrors.studentId ?? studentCheckState.message
  const studentStatus: GdgFieldStatus | undefined =
    fieldErrors.studentId || studentCheckState.status === 'error' || studentCheckState.status === 'duplicate' || studentCheckState.status === 'unverified'
      ? 'error'
      : studentCheckState.status === 'available'
        ? 'success'
        : undefined
  const phoneStatusMessage = fieldErrors.phoneNumber ?? phoneCheckState.message
  const phoneStatus: GdgFieldStatus | undefined =
    fieldErrors.phoneNumber || phoneCheckState.status === 'error' || phoneCheckState.status === 'duplicate' || phoneCheckState.status === 'unverified'
      ? 'error'
      : phoneCheckState.status === 'available'
        ? 'success'
        : undefined
  const majorStatusMessage = fieldErrors.major ? '※ 필수 선택 사항입니다.' : undefined

  return (
    <>
      <Loader isLoading={loading} />
      <div className="relative min-h-screen bg-black text-white">
        {initializing ? (
          <div className="mx-auto mt-24 rounded-2xl bg-black/60 p-8 text-center text-white">
            <p className="text-lg font-semibold">Google 정보를 불러오는 중입니다.</p>
            <p className="text-sm text-white/70">잠시만 기다려주세요.</p>
          </div>
        ) : pendingInfo ? (
          <form onSubmit={handleSubmit} className="relative z-10 pt-18 pb-30 mobile:pt-12 mobile:pb-36">
            <div className="px-6 mobile:px-4">
              <div className="layout-grid layout-grid--narrow-screen layout-grid--4 gap-y-8 mobile:gap-y-6">
                <div className="col-span-4 flex items-center gap-3 pb-8 mobile:gap-2 mobile:pb-2">
                  <GdgLogo mode="auto" />
                  <p className="typo-h3 mobile:typo-m-h3 text-white">회원가입</p>
                </div>

                <div className="col-span-4">
                  <GdgFieldContainer label="이름" required>
                  <GdgInput
                    aria-label="이름"
                    placeholder="홍길동"
                    value={name}
                    onValueChange={setName}
                    classNames={signupInputClassNames}
                    isInvalid={Boolean(fieldErrors.name)}
                    errorMessage={fieldErrors.name}
                  />
                  </GdgFieldContainer>
                </div>

                <div className="col-span-4">
                  <GdgFieldContainer
                    label="학과"
                    required
                    caption="검색 혹은 스크롤하여 지정하세요."
                    status={majorStatusMessage ? 'error' : undefined}
                    statusMessage={majorStatusMessage}
                  >
                  <span className="hidden pc:block">
                    <GdgMajorDropdown
                      device="pc"
                      value={major}
                      onChangeAction={handleMajorChange}
                      isInvalid={Boolean(fieldErrors.major)}
                    />
                  </span>
                  <span className="block pc:hidden">
                    <GdgMajorDropdown
                      device="mobile"
                      value={major}
                      onChangeAction={handleMajorChange}
                      isInvalid={Boolean(fieldErrors.major)}
                    />
                  </span>
                </GdgFieldContainer>
              </div>

                <div className="col-span-4">
                  <GdgFieldContainer
                    label="학번"
                    required
                    status={studentStatus}
                    statusMessage={studentStatusMessage}
                  >
                  <div className="flex items-center gap-5 mobile:gap-2">
                    <div className="min-w-0 flex-1 pc:max-w-102 mobile:max-w-56">
                      <GdgInput
                        aria-label="학번"
                        placeholder="학번을 입력해 주세요."
                        value={studentId}
                        onValueChange={handleStudentIdChange}
                        classNames={signupInputClassNames}
                        isInvalid={Boolean(fieldErrors.studentId) || studentHasCheckError}
                      />
                    </div>
                    <Button
                      type="button"
                      onPress={handleStudentCheck}
                      isDisabled={isStudentCheckDisabled}
                      className="typo-b2 mobile:typo-m-b3 h-11 min-w-0 w-30 rounded-full bg-red text-white mobile:w-27 disabled:bg-gray-400 disabled:text-white/70"
                    >
                      {studentCheckState.status === 'checking' ? '확인 중' : '중복 확인'}
                    </Button>
                  </div>
                  </GdgFieldContainer>
                </div>

                <div className="col-span-4">
                  <GdgFieldContainer
                    label="전화번호"
                    required
                    status={phoneStatus}
                    statusMessage={phoneStatusMessage}
                  >
                  <div className="flex items-center gap-5 mobile:gap-2">
                    <div className="min-w-0 flex-1 pc:max-w-102 mobile:max-w-56">
                      <GdgInput
                        aria-label="전화번호"
                        placeholder="전화번호를 입력해 주세요."
                        value={phoneNumber}
                        onValueChange={handlePhoneNumberChange}
                        classNames={signupInputClassNames}
                        isInvalid={Boolean(fieldErrors.phoneNumber) || phoneHasCheckError}
                      />
                    </div>
                    <Button
                      type="button"
                      onPress={handlePhoneCheck}
                      isDisabled={isPhoneCheckDisabled}
                      className={cn(
                        'typo-b2 mobile:typo-m-b3 h-11 min-w-0 w-30 rounded-full text-white mobile:w-27',
                        isPhoneCheckDisabled ? 'bg-gray-500 text-white/80' : 'bg-red'
                      )}
                    >
                      {phoneCheckState.status === 'checking' ? '확인 중' : '중복 확인'}
                    </Button>
                  </div>
                  </GdgFieldContainer>
                </div>

                {globalError && (
                  <p className="typo-c1 mobile:typo-c2 col-span-4 text-center text-red">
                    {globalError}
                  </p>
                )}

                <div className="col-span-4 flex justify-end gap-5 pt-12 mobile:grid mobile:grid-cols-3 mobile:gap-2 mobile:pt-8">
                  <div className="hidden mobile:block" aria-hidden />
                  <Button
                    type="button"
                    onPress={() => router.replace(`/login?next=${encodeURIComponent(nextUrl)}`)}
                    className="typo-b2 mobile:typo-m-b3 h-11 min-w-0 w-30 rounded-full bg-gray-200 text-white mobile:w-full"
                  >
                    이전
                  </Button>
                  <Button
                    type="submit"
                    isLoading={loading}
                    isDisabled={loading || !pendingInfo || isPreview || !isSignupReady}
                    className={cn(
                      'typo-b2 mobile:typo-m-b3 h-11 min-w-0 w-30 rounded-full text-white disabled:bg-gray-300 disabled:text-white/60 mobile:w-full',
                      isSignupReady && !loading && pendingInfo && !isPreview ? 'bg-red' : 'bg-gray-500'
                    )}
                  >
                    회원가입
                  </Button>
                </div>
              </div>
            </div>
          </form>
        ) : null}
      </div>
    </>
  )
}
