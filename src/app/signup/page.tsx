'use client'

import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import Loader from '@/components/ui/common/Loader'
import { PrivacyPolicyNotice } from '@/components/ui/common/PrivacyPolicyNotice'
import { GdgLogo, GdgMajorDropdown } from '@/components/ui/design-system'
import {
  DuskField,
  DUSK_CANCEL_BUTTON,
  DUSK_CHECKBOX,
  DUSK_INPUT,
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
import { usePhoneNumber } from '@/hooks/usePhoneNumber'
import { unwrapApiResponse } from '@/utils/api/unwrap'
import { cn } from '@/utils/cn'

const DEFAULT_FALLBACK_ROUTE = '/'
const STUDENT_ID_PATTERN = /^12\d{6}$/

/** 이름은 구글 계정에서 채워 오므로 단계에 넣지 않는다. */
const TOTAL_STEPS = 4

/** 채운 칸 수에 맞춰 바뀌는 안내. 마지막 두 개만 재촉하는 말을 쓴다. */
const PROGRESS_MESSAGES = [
  '네 가지만 채우면 끝나요',
  '좋아요, 이어서 채워 주세요',
  '절반 넘었어요',
  '거의 다 왔어요!',
  '이제 가입만 누르면 돼요'
]

/** 입력이 멈춘 뒤 중복 확인을 보내기까지 기다리는 시간. */
const DUPLICATE_CHECK_DELAY_MS = 500

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
          message: '이 학번으로 가입할 수 있어요',
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
          message: '이 번호로 가입할 수 있어요',
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
          message: '이미 가입된 학번이에요',
          checkedValue: candidate
        })
        return
      }

      setStudentCheckState({
        status: 'available',
        message: '이 학번으로 가입할 수 있어요',
        checkedValue: candidate,
        verifiedValue: candidate
      })
    } catch {
      setStudentCheckState({
        status: 'error',
        message: '확인에 실패했어요. 잠시 뒤 다시 해 주세요',
        checkedValue: candidate
      })
    }
  }, [studentId])

  const handlePhoneCheck = useCallback(async () => {
    const candidate = phoneNumber.trim()
    if (!candidate || !isValidFormat(candidate)) return

    const digits = toDigits(candidate)
    setPhoneCheckState({ status: 'checking', checkedValue: candidate })

    try {
      const response = await checkPhoneNumberDuplicated(digits)
      const data = unwrapApiResponse<DuplicateCheckResponseBody>(response.data)
      if (data?.isExists) {
        setPhoneCheckState({
          status: 'duplicate',
          message: '이미 가입된 번호예요',
          checkedValue: candidate
        })
        return
      }

      setPhoneCheckState({
        status: 'available',
        message: '이 번호로 가입할 수 있어요',
        checkedValue: candidate,
        verifiedValue: candidate
      })
    } catch {
      setPhoneCheckState({
        status: 'error',
        message: '확인에 실패했어요. 잠시 뒤 다시 해 주세요',
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

  /**
   * 입력이 멈추면 알아서 중복을 확인한다. 확인 버튼을 따로 두면 한 칸에서 할 일이 둘이 된다.
   * 이미 보낸 값이면 다시 보내지 않는다 — 판정 결과가 상태에 반영되며 이 effect 가 다시 도는데,
   * 그때 가드가 없으면 같은 값으로 요청이 한 번 더 나간다.
   */
  useEffect(() => {
    const candidate = studentId.trim()
    if (!STUDENT_ID_PATTERN.test(candidate)) return
    if (candidate === studentCheckState.verifiedValue) return
    if (studentCheckState.status !== 'idle' && candidate === studentCheckState.checkedValue) return

    const timer = setTimeout(() => {
      void handleStudentCheck()
    }, DUPLICATE_CHECK_DELAY_MS)

    return () => clearTimeout(timer)
  }, [studentId, studentCheckState, handleStudentCheck])

  useEffect(() => {
    const candidate = phoneNumber.trim()
    if (!isValidFormat(candidate)) return
    if (candidate === phoneCheckState.verifiedValue) return
    if (phoneCheckState.status !== 'idle' && candidate === phoneCheckState.checkedValue) return

    const timer = setTimeout(() => {
      void handlePhoneCheck()
    }, DUPLICATE_CHECK_DELAY_MS)

    return () => clearTimeout(timer)
  }, [phoneNumber, phoneCheckState, handlePhoneCheck, isValidFormat])

  const completedSteps =
    (major !== '' ? 1 : 0) +
    (isStudentVerified ? 1 : 0) +
    (isPhoneVerified ? 1 : 0) +
    (isPrivacyAgreed ? 1 : 0)

  /**
   * 다음 칸은 앞 칸을 채우면 열린다. 한 번 열린 칸은 값을 지워도 닫지 않는다 —
   * 고치는 도중에 아래가 사라지면 어디까지 썼는지 알 수 없다.
   */
  const [openStep, setOpenStep] = useState(1)

  useEffect(() => {
    setOpenStep((prev) => Math.max(prev, Math.min(completedSteps + 1, TOTAL_STEPS)))
  }, [completedSteps])

  const studentInputRef = useRef<HTMLInputElement>(null)
  const phoneInputRef = useRef<HTMLInputElement>(null)
  const agreementRef = useRef<HTMLLabelElement>(null)

  /** 새로 열린 칸으로 바로 이어 쓸 수 있게 옮겨 준다. 첫 칸(학과)에는 주지 않는다. */
  useEffect(() => {
    if (openStep === 2) {
      studentInputRef.current?.focus()
    } else if (openStep === 3) {
      phoneInputRef.current?.focus()
    } else if (openStep === 4) {
      agreementRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [openStep])

  const studentHint = isStudentVerified ? (
    <span className="text-signal-ok">{studentCheckState.message}</span>
  ) : studentCheckState.status === 'checking' ? (
    '확인하고 있어요…'
  ) : (
    '인하대 학번 8자리를 적어 주세요'
  )

  const phoneHint = isPhoneVerified ? (
    <span className="text-signal-ok">{phoneCheckState.message}</span>
  ) : phoneCheckState.status === 'checking' ? (
    '확인하고 있어요…'
  ) : (
    '연락받을 번호를 적어 주세요'
  )

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
            몇 가지만 알려주시면 바로 시작할 수 있어요.
          </p>

          <div className="mt-7">
            <div className="flex items-baseline justify-between gap-3">
              <p className="break-keep text-[13px] text-dusk-ink-500" aria-live="polite">
                {PROGRESS_MESSAGES[completedSteps]}
              </p>
              <p className="shrink-0 text-[13px] tabular-nums text-dusk-ink-700">
                {completedSteps}/{TOTAL_STEPS}
              </p>
            </div>
            <div
              className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-[rgba(240,234,228,0.10)]"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={TOTAL_STEPS}
              aria-valuenow={completedSteps}
              aria-label="회원가입 진행률"
            >
              <div
                className="h-full rounded-full bg-ember transition-[width] duration-500 ease-out"
                style={{ width: `${(completedSteps / TOTAL_STEPS) * 100}%` }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-[22px]">
            <DuskField label="이름" required hint="구글 계정에서 가져왔어요. 다르면 고쳐 주세요.">
              <input
                type="text"
                aria-label="이름"
                placeholder="이름을 알려주세요"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={DUSK_INPUT}
              />
            </DuskField>

            <DuskField label="학과" required>
              <GdgMajorDropdown
                value={major}
                onChangeAction={setMajor}
                device="pc"
                tone="dusk"
                placeholder="학과 이름을 검색해 보세요"
              />
            </DuskField>

            {openStep >= 2 ? (
              <div className="animate-dusk-reveal">
                <DuskField label="학번" required error={studentError} hint={studentHint}>
                  <input
                    ref={studentInputRef}
                    type="text"
                    inputMode="numeric"
                    aria-label="학번"
                    placeholder="예) 12200535"
                    value={studentId}
                    onChange={(event) => handleStudentIdChange(event.target.value)}
                    className={DUSK_INPUT}
                  />
                </DuskField>
              </div>
            ) : null}

            {openStep >= 3 ? (
              <div className="animate-dusk-reveal">
                <DuskField label="전화번호" required error={phoneError} hint={phoneHint}>
                  <input
                    ref={phoneInputRef}
                    type="tel"
                    inputMode="numeric"
                    aria-label="전화번호"
                    placeholder="예) 010-1234-5678"
                    value={phoneNumber}
                    onChange={(event) => handlePhoneNumberChange(event.target.value)}
                    className={DUSK_INPUT}
                  />
                </DuskField>
              </div>
            ) : null}

            {openStep >= 4 ? (
              <div className="animate-dusk-reveal flex flex-col gap-[22px]">
                <PrivacyPolicyNotice target="signup" showTitle={false} compact />

                <label
                  ref={agreementRef}
                  className="flex cursor-pointer items-start gap-2.5 rounded-[14px] border border-[rgba(240,234,228,0.12)] px-[18px] py-4"
                >
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
              </div>
            ) : null}

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
                가입하고 시작하기
              </button>
            </div>
          </form>
        </main>
      ) : null}
    </>
  )
}
