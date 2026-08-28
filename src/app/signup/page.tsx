'use client'

import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import Loader from '@/components/ui/common/Loader'
import { PrivacyPolicyNotice } from '@/components/ui/common/PrivacyPolicyNotice'
import { GdgLogo } from '@/components/ui/design-system'
import {
  DuskField,
  DUSK_CANCEL_BUTTON,
  DUSK_CHECKBOX,
  DUSK_GHOST_BUTTON,
  DUSK_INPUT,
  DUSK_OPTION,
  DUSK_SELECT,
  DUSK_SUBMIT_BUTTON
} from '@/components/ui/dusk/DuskForm'
import { useAuth } from '@/hooks/useAuth'
import {
  checkPhoneNumberDuplicated,
  checkStudentIdDuplicated,
  type DuplicateCheckResponseBody,
  type SignupResponseBody,
  signupWithProfile
} from '@/services/auth/authClient'
import { PENDING_SIGNUP_STORAGE_KEY, type PendingSignupPayload } from '@/constant/auth'
import { majorOptions } from '@/constant/majorOptions'
import { usePhoneNumber } from '@/hooks/usePhoneNumber'
import { unwrapApiResponse } from '@/utils/api/unwrap'
import { cn } from '@/utils/cn'

const DEFAULT_FALLBACK_ROUTE = '/'
const STUDENT_ID_PATTERN = /^12\d{6}$/

const getSafeNextUrl = (raw: string | null): string => {
  if (!raw) return DEFAULT_FALLBACK_ROUTE

  try {
    const decoded = decodeURIComponent(raw)
    return decoded.startsWith('/') && !decoded.startsWith('//') ? decoded : DEFAULT_FALLBACK_ROUTE
  } catch {
    return DEFAULT_FALLBACK_ROUTE
  }
}

type DuplicateCheckStatus = 'idle' | 'checking' | 'available' | 'duplicate' | 'unverified' | 'error'

interface DuplicateCheckState {
  status: DuplicateCheckStatus
  message?: string
  checkedValue?: string
  verifiedValue?: string
}

/** 중복 확인 버튼. 입력칸 오른쪽에 붙으므로 높이를 입력칸에 맞춘다. */
const DUPLICATE_CHECK_BUTTON = cn(DUSK_GHOST_BUTTON, 'shrink-0 px-[18px] py-3.5')

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser } = useAuth()
  const { formatInput, isValidFormat, toDigits } = usePhoneNumber()
  const isPreview = searchParams?.get('preview') === '1'

  const [pendingInfo, setPendingInfo] = useState<PendingSignupPayload | null>(null)
  const [initializing, setInitializing] = useState(true)
  const [name, setName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [major, setMajor] = useState('')
  const [isPrivacyAgreed, setIsPrivacyAgreed] = useState(false)
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

  const phoneDigits = toDigits(phoneNumber)

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
      const nextValue = formatInput(value)
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
    if (!candidate || !isValidFormat(candidate)) return

    const digits = toDigits(candidate)
    setPhoneCheckState({ status: 'checking', checkedValue: digits })

    try {
      const response = await checkPhoneNumberDuplicated(digits)
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
    !isValidFormat(phoneNumber) ||
    phoneCheckState.status === 'checking' ||
    phoneNumber.trim() === phoneCheckState.verifiedValue

  const isSignupReady =
    name.trim() !== '' &&
    major !== '' &&
    studentId.trim() === studentCheckState.verifiedValue &&
    phoneNumber.trim() === phoneCheckState.verifiedValue &&
    isPrivacyAgreed

  const isStudentVerified = studentId !== '' && studentId === studentCheckState.verifiedValue
  const isPhoneVerified = phoneNumber !== '' && phoneNumber === phoneCheckState.verifiedValue

  const studentError =
    !isStudentVerified &&
    (studentCheckState.status === 'duplicate' || studentCheckState.status === 'error')
      ? studentCheckState.message
      : undefined

  const phoneError =
    !isPhoneVerified &&
    (phoneCheckState.status === 'duplicate' || phoneCheckState.status === 'error')
      ? phoneCheckState.message
      : undefined

  return (
    <>
      <Loader isLoading={loading} />
      {initializing ? null : pendingInfo ? (
        <main className="mx-auto w-full max-w-[560px] px-[clamp(20px,5vw,44px)] pb-[100px] pt-14">
          <div className="flex items-center gap-3">
            <GdgLogo mode="auto" />
            <h1 className="text-[clamp(24px,2.8vw,34px)] font-semibold leading-[1.26] tracking-[-0.03em]">
              회원가입
            </h1>
          </div>
          <p className="mt-3 break-keep text-[15px] text-dusk-ink-600">
            GDGoC INHA 홈페이지에서 쓸 정보를 입력해 주세요.
          </p>

          <form onSubmit={handleSubmit} className="mt-[38px] flex flex-col gap-[22px]">
            <DuskField label="이름" required>
              <input
                type="text"
                aria-label="이름"
                placeholder="이름을 입력해 주세요."
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={DUSK_INPUT}
              />
            </DuskField>

            <DuskField label="학과" required>
              <select
                aria-label="학과"
                value={major}
                onChange={(event) => setMajor(event.target.value)}
                className={cn(DUSK_SELECT, major === '' && 'text-dusk-ink-800')}
              >
                <option value="" className={DUSK_OPTION}>
                  학과를 선택해 주세요.
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
              label="학번"
              required
              error={studentError}
              hint={
                isStudentVerified ? (
                  <span className="text-signal-ok">※ 가입 가능한 학번입니다.</span>
                ) : (
                  '8자리 학번을 입력한 뒤 중복 확인을 눌러 주세요.'
                )
              }
            >
              <div className="flex gap-2.5">
                <input
                  type="text"
                  inputMode="numeric"
                  aria-label="학번"
                  placeholder="학번을 입력해 주세요."
                  value={studentId}
                  onChange={(event) => handleStudentIdChange(event.target.value)}
                  className={DUSK_INPUT}
                />
                <button
                  type="button"
                  onClick={handleStudentCheck}
                  disabled={isStudentCheckDisabled}
                  className={DUPLICATE_CHECK_BUTTON}
                >
                  중복 확인
                </button>
              </div>
            </DuskField>

            <DuskField
              label="전화번호"
              required
              error={phoneError}
              hint={
                isPhoneVerified ? (
                  <span className="text-signal-ok">※ 가입 가능한 전화번호입니다.</span>
                ) : (
                  '전화번호를 입력한 뒤 중복 확인을 눌러 주세요.'
                )
              }
            >
              <div className="flex gap-2.5">
                <input
                  type="tel"
                  inputMode="numeric"
                  aria-label="전화번호"
                  placeholder="전화번호를 입력해 주세요."
                  value={phoneNumber}
                  onChange={(event) => handlePhoneNumberChange(event.target.value)}
                  className={DUSK_INPUT}
                />
                <button
                  type="button"
                  onClick={handlePhoneCheck}
                  disabled={isPhoneCheckDisabled}
                  className={DUPLICATE_CHECK_BUTTON}
                >
                  중복 확인
                </button>
              </div>
            </DuskField>

            <PrivacyPolicyNotice target="signup" showTitle={false} compact />

            <label className="flex cursor-pointer items-start gap-2.5 rounded-[14px] border border-[rgba(240,234,228,0.12)] px-[18px] py-4">
              <input
                type="checkbox"
                checked={isPrivacyAgreed}
                onChange={(event) => setIsPrivacyAgreed(event.target.checked)}
                className={cn(DUSK_CHECKBOX, 'mt-[3px]')}
              />
              <span className="text-[15px] leading-[1.7] text-dusk-ink-400">
                개인정보 처리방침에 동의합니다.
                <span className="text-signal-err"> *</span>
              </span>
            </label>

            {globalError ? (
              <p className="text-[13px] leading-[1.7] text-signal-err">{globalError}</p>
            ) : null}

            <div className="mt-1.5 flex gap-3">
              <button
                type="button"
                onClick={() => router.replace(`/login?next=${encodeURIComponent(nextUrl)}`)}
                className={DUSK_CANCEL_BUTTON}
              >
                이전
              </button>
              <button
                type="submit"
                disabled={!isSignupReady || loading}
                className={DUSK_SUBMIT_BUTTON}
              >
                회원가입
              </button>
            </div>
          </form>
        </main>
      ) : null}
    </>
  )
}
