'use client'

import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { useRouter, useSearchParams } from 'next/navigation'

import { GdgMajorDropdown } from '@/components/ui/design-system/GdgMajorDropdown'
import {
  GdgButton,
  GdgFieldContainer,
  GdgLogo,
  GdgInputField,
  type GdgFieldStatus
} from '@/components/ui/design-system'
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
import {
  formatPhoneNumberInput,
  isPhoneNumberFormatValid,
  toPhoneDigits
} from '@/utils/phoneNumber'

const DEFAULT_FALLBACK_ROUTE = '/'
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

  const requestedNext = pendingInfo?.next ?? searchParams?.get('next') ?? null
  const nextUrl = useMemo(() => getSafeNextUrl(requestedNext), [requestedNext])

  const phoneDigits = toPhoneDigits(phoneNumber)

  const handleStudentIdChange = useCallback(
    (value: string) => {
      const nextValue = value.replace(/\D/g, '').slice(0, 8)
      setStudentId(nextValue)
      
      if (studentCheckState.verifiedValue === nextValue && nextValue !== '') {
        setStudentCheckState((prev) => ({
          ...prev,
          status: 'available',
          message: '※ 가입 가능한 학번입니다.',
          checkedValue: nextValue
        }))
      } else {
        setStudentCheckState((prev) => ({ 
          status: 'idle', 
          verifiedValue: prev.verifiedValue 
        }))
      }
    },
    [studentCheckState.verifiedValue]
  )

  const handlePhoneNumberChange = useCallback(
    (value: string) => {
      const nextValue = formatPhoneNumberInput(value)
      setPhoneNumber(nextValue)

      if (phoneCheckState.verifiedValue === nextValue && nextValue !== '') {
        setPhoneCheckState((prev) => ({
          ...prev,
          status: 'available',
          message: '※ 가입 가능한 전화번호입니다.',
          checkedValue: nextValue
        }))
      } else {
        setPhoneCheckState((prev) => ({ 
          status: 'idle', 
          verifiedValue: prev.verifiedValue 
        }))
      }
    },
    [phoneCheckState.verifiedValue]
  )

  const handleStudentCheck = useCallback(async () => {
    const candidate = studentId.trim()
    if (!candidate || !STUDENT_ID_PATTERN.test(candidate)) return

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
    } catch {
      setStudentCheckState({
        status: 'error',
        message: '※ 중복 확인 중 오류가 발생했습니다.',
        checkedValue: candidate
      })
    }
  }, [studentId])

  const handlePhoneCheck = useCallback(async () => {
    const candidate = phoneNumber.trim()
    if (!candidate || !isPhoneNumberFormatValid(candidate)) return

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
    } catch {
      setPhoneCheckState({
        status: 'error',
        message: '※ 중복 확인 중 오류가 발생했습니다.',
        checkedValue: candidate
      })
    }
  }, [phoneNumber])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isPreview || !pendingInfo) return

    setLoading(true)

    try {
      const response = await signupWithProfile({
        oauthSubject: pendingInfo.oauthSubject,
        email: pendingInfo.email,
        name: name.trim(),
        studentId: studentId.trim(),
        phoneNumber: phoneDigits,
        major,
        image: pendingInfo.picture
      })

      const data = unwrapApiResponse<SignupResponseBody>(response.data)
      if (data?.user && data.accessToken && data.refreshToken) {
        console.log('[SignupPage] Signup success, saving to storage')
        setUser(data.user, data.accessToken, data.refreshToken)
      } else {
        console.warn('[SignupPage] Signup success but missing data', { 
          hasUser: !!data?.user, 
          hasAt: !!data?.accessToken, 
          hasRt: !!data?.refreshToken 
        })
      }
      sessionStorage.removeItem(PENDING_SIGNUP_STORAGE_KEY)
      router.replace(nextUrl)
    } catch (error: any) {
      setGlobalError(error.response?.data?.message || '회원가입 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const isStudentCheckDisabled = 
    !studentId.trim() || 
    !STUDENT_ID_PATTERN.test(studentId.trim()) || 
    studentCheckState.status === 'checking' || 
    studentId.trim() === studentCheckState.verifiedValue

  const isPhoneCheckDisabled = 
    !phoneNumber.trim() || 
    !isPhoneNumberFormatValid(phoneNumber) || 
    phoneCheckState.status === 'checking' || 
    phoneNumber.trim() === phoneCheckState.verifiedValue

  const isSignupReady =
    name.trim() !== '' &&
    major !== '' &&
    studentId.trim() === studentCheckState.verifiedValue &&
    phoneNumber.trim() === phoneCheckState.verifiedValue

  const studentStatusMessage = studentId === studentCheckState.verifiedValue ? '※ 가입 가능한 학번입니다.' : studentCheckState.message
  const studentStatus: GdgFieldStatus | undefined =
    studentId === studentCheckState.verifiedValue
      ? 'success'
      : (studentCheckState.status === 'error' || studentCheckState.status === 'duplicate' ? 'error' : undefined)

  const phoneStatusMessage = phoneNumber === phoneCheckState.verifiedValue ? '※ 가입 가능한 전화번호입니다.' : phoneCheckState.message
  const phoneStatus: GdgFieldStatus | undefined =
    phoneNumber === phoneCheckState.verifiedValue
      ? 'success'
      : (phoneCheckState.status === 'error' || phoneCheckState.status === 'duplicate' ? 'error' : undefined)

  return (
    <>
      <Loader isLoading={loading} />
      <div className="relative min-h-screen bg-black text-white overflow-x-hidden">
        {initializing ? null : pendingInfo ? (
          <form onSubmit={handleSubmit} className="relative z-10 pt-18 pb-30 mobile:pt-12 mobile:pb-36">
            <div className="layout-grid layout-grid--narrow-screen layout-grid--4 gap-y-8 mobile:gap-y-6">
              <div className="col-span-4 flex items-center gap-3 pb-8 mobile:gap-2 mobile:pb-2">
                <GdgLogo mode="auto" />
                <p className="typo-h3 mobile:typo-m-h3 text-white">회원가입</p>
              </div>

              {/* PC Version */}
              <div className="pc:contents hidden">
                <div className="col-span-4">
                  <GdgFieldContainer label="이름" required>
                    <GdgInputField device="pc" aria-label="이름" placeholder="홍길동" value={name} onChange={(e) => setName(e.target.value)} state={fieldErrors.name ? 'error' : 'available'} width="full" />
                  </GdgFieldContainer>
                </div>
                <div className="col-span-4">
                  <GdgFieldContainer label="학과" required caption="검색 또는 스크롤하여 지정하세요." status={fieldErrors.major ? 'error' : undefined} statusMessage={fieldErrors.major ? '※ 필수 선택 사항입니다.' : undefined}>
                    <GdgMajorDropdown device="pc" value={major} onChangeAction={setMajor} />
                  </GdgFieldContainer>
                </div>
                <div className="col-span-4">
                  <GdgFieldContainer 
                    label="학번" 
                    required 
                    status={studentStatus} 
                    statusMessage={studentStatusMessage}
                    action={
                      <GdgButton device="pc" type="button" onClick={handleStudentCheck} disabled={isStudentCheckDisabled} size="small" variant={!isStudentCheckDisabled ? 'active' : 'default'}>중복 확인</GdgButton>
                    }
                  >
                    <>
                      <GdgInputField device="pc" aria-label="학번" placeholder="학번을 입력해 주세요." value={studentId} onChange={(e) => handleStudentIdChange(e.target.value)} state={studentStatus === 'error' ? 'error' : 'available'} width="twoThirds" />
                    </>
                  </GdgFieldContainer>
                </div>
                <div className="col-span-4">
                  <GdgFieldContainer 
                    label="전화번호" 
                    required 
                    status={phoneStatus} 
                    statusMessage={phoneStatusMessage}
                    action={
                      <GdgButton device="pc" type="button" onClick={handlePhoneCheck} disabled={isPhoneCheckDisabled} size="small" variant={!isPhoneCheckDisabled ? 'active' : 'default'}>중복 확인</GdgButton>
                    }
                  >
                    <>
                      <GdgInputField device="pc" aria-label="전화번호" placeholder="전화번호를 입력해 주세요." value={phoneNumber} onChange={(e) => handlePhoneNumberChange(e.target.value)} state={phoneStatus === 'error' ? 'error' : 'available'} width="twoThirds" />
                    </>
                  </GdgFieldContainer>
                </div>
              </div>

              {/* Mobile Version */}
              <div className="pc:hidden contents">
                <div className="col-span-4">
                  <GdgFieldContainer label="이름" required>
                    <GdgInputField device="mobile" aria-label="이름" placeholder="홍길동" value={name} onChange={(e) => setName(e.target.value)} state={fieldErrors.name ? 'error' : 'available'} width="full" />
                  </GdgFieldContainer>
                </div>
                <div className="col-span-4">
                  <GdgFieldContainer label="학과" required caption="검색 혹은 스크롤하여 지정하세요." status={fieldErrors.major ? 'error' : undefined} statusMessage={fieldErrors.major ? '※ 필수 선택 사항입니다.' : undefined}>
                    <GdgMajorDropdown device="mobile" value={major} onChangeAction={setMajor} />
                  </GdgFieldContainer>
                </div>
                <div className="col-span-4">
                  <GdgFieldContainer 
                    label="학번" 
                    required 
                    status={studentStatus} 
                    statusMessage={studentStatusMessage}
                    action={
                      <GdgButton device="mobile" type="button" onClick={handleStudentCheck} disabled={isStudentCheckDisabled} size="small" variant={!isStudentCheckDisabled ? 'active' : 'default'}>중복 확인</GdgButton>
                    }
                  >
                    <>
                      <GdgInputField device="mobile" aria-label="학번" placeholder="학번을 입력해 주세요." value={studentId} onChange={(e) => handleStudentIdChange(e.target.value)} state={studentStatus === 'error' ? 'error' : 'available'} width="twoThirds" />
                    </>
                  </GdgFieldContainer>
                </div>
                <div className="col-span-4">
                  <GdgFieldContainer 
                    label="전화번호" 
                    required 
                    status={phoneStatus} 
                    statusMessage={phoneStatusMessage}
                    action={
                      <GdgButton device="mobile" type="button" onClick={handlePhoneCheck} disabled={isPhoneCheckDisabled} size="small" variant={!isPhoneCheckDisabled ? 'active' : 'default'}>중복 확인</GdgButton>
                    }
                  >
                    <>
                      <GdgInputField device="mobile" aria-label="전화번호" placeholder="전화번호를 입력해 주세요." value={phoneNumber} onChange={(e) => handlePhoneNumberChange(e.target.value)} state={phoneStatus === 'error' ? 'error' : 'available'} width="twoThirds" />
                    </>
                  </GdgFieldContainer>
                </div>
              </div>

              {globalError && <p className="typo-c1 col-span-4 text-center text-red">{globalError}</p>}

              <div className="col-span-4 flex justify-end gap-5 pt-12 mobile:grid mobile:grid-cols-3 mobile:gap-2 mobile:pt-8">
                <div className="hidden mobile:block" aria-hidden />
                <div className="pc:contents hidden">
                  <GdgButton device="pc" type="button" onClick={() => router.replace(`/login?next=${encodeURIComponent(nextUrl)}`)} size="small" variant="default">이전</GdgButton>
                  <GdgButton device="pc" type="submit" loading={loading} disabled={!isSignupReady || loading} size="small" variant={isSignupReady ? 'active' : 'disabled'}>회원가입</GdgButton>
                </div>
                <div className="pc:hidden contents">
                  <GdgButton device="mobile" type="button" onClick={() => router.replace(`/login?next=${encodeURIComponent(nextUrl)}`)} size="small" variant="default" fullWidth>이전</GdgButton>
                  <GdgButton device="mobile" type="submit" loading={loading} disabled={!isSignupReady || loading} size="small" variant={isSignupReady ? 'active' : 'disabled'} fullWidth>회원가입</GdgButton>
                </div>
              </div>
            </div>
          </form>
        ) : null}
      </div>
    </>
  )
}
