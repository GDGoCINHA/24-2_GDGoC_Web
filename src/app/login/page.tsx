'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

import { useLandingContent } from '@/components/landing/LandingContentProvider'
import Loader from '@/components/ui/common/Loader'
import { GdgLogo } from '@/components/ui/design-system'
import { DUSK_INPUT, DUSK_SUBMIT_BUTTON } from '@/components/ui/dusk/DuskForm'
import { useAuth } from '@/hooks/useAuth'
import {
  type LoginApiResponseBody,
  type LoginExistingUserResponse,
  type LoginNewUserResponse,
  loginWithAdminCredentials,
  loginWithGoogleIdToken
} from '@/services/auth/authClient'
import { PENDING_SIGNUP_STORAGE_KEY, type PendingSignupPayload } from '@/constant/auth'
import { unwrapApiResponse } from '@/utils/api/unwrap'
import { cn } from '@/utils/cn'

const DEFAULT_FALLBACK_ROUTE = '/'

const getSafeNextUrl = (raw: string | null): string => {
  if (!raw) return DEFAULT_FALLBACK_ROUTE

  try {
    const decoded = decodeURIComponent(raw)
    if (decoded.startsWith('/') && !decoded.startsWith('//')) return decoded

    if (typeof window !== 'undefined') {
      const parsed = new URL(decoded, window.location.origin)
      if (parsed.origin === window.location.origin) {
        const nextPath = `${parsed.pathname}${parsed.search}${parsed.hash}`
        return nextPath.startsWith('/') && !nextPath.startsWith('//')
          ? nextPath
          : DEFAULT_FALLBACK_ROUTE
      }
    }

    return DEFAULT_FALLBACK_ROUTE
  } catch {
    return DEFAULT_FALLBACK_ROUTE
  }
}

const isNewUserResponse = (payload: LoginApiResponseBody): payload is LoginNewUserResponse =>
  payload.isNewUser === true

const isExistingUserResponse = (
  payload: LoginApiResponseBody
): payload is LoginExistingUserResponse => payload.isNewUser === false

interface GoogleStatePayload {
  next?: string
  ts?: number
}

const GOOGLE_OIDC_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth'

const serializeState = (payload: GoogleStatePayload): string => {
  try {
    return encodeURIComponent(JSON.stringify(payload))
  } catch {
    return ''
  }
}

const deserializeState = (raw: string | null): GoogleStatePayload | null => {
  if (!raw) return null
  try {
    return JSON.parse(decodeURIComponent(raw)) as GoogleStatePayload
  } catch {
    return null
  }
}

const generateNonce = (): string => {
  if (typeof window === 'undefined' || !window.crypto?.getRandomValues) {
    return Math.random().toString(36).slice(2)
  }
  const buffer = new Uint8Array(16)
  window.crypto.getRandomValues(buffer)
  return Array.from(buffer, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, setUser } = useAuth()
  const { hero } = useLandingContent()

  const baseNextUrl = useMemo(
    () => getSafeNextUrl(searchParams?.get('next') ?? null),
    [searchParams]
  )
  const [nextOverride, setNextOverride] = useState<string | null>(null)
  const nextUrl = nextOverride ?? baseNextUrl

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [adminId, setAdminId] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const isDashboardLogin = nextUrl.startsWith('/dashboard')
  const showAdminLogin =
    isDashboardLogin &&
    ['1', 'true', 'admin'].includes((searchParams?.get('admin') ?? '').toLowerCase())

  const googleClientId =
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_CLIENT_ID ??
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ??
    ''
  const googleRedirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ?? ''
  const canUseGoogleLogin = Boolean(googleClientId)

  useEffect(() => {
    if (user) {
      router.replace(nextUrl)
    }
  }, [user, nextUrl, router])

  const persistPendingSignup = useCallback((payload: PendingSignupPayload) => {
    if (typeof window === 'undefined') return
    sessionStorage.setItem(PENDING_SIGNUP_STORAGE_KEY, JSON.stringify(payload))
  }, [])

  const handleIdTokenLogin = useCallback(
    async (idToken: string, overrideNextUrl?: string) => {
      const targetNext = overrideNextUrl ?? nextUrl
      setLoading(true)
      setErrorMessage(null)

      try {
        const response = await loginWithGoogleIdToken(idToken)
        const data = unwrapApiResponse<LoginApiResponseBody>(response.data)

        if (!data) {
          throw new Error('로그인 응답을 해석할 수 없습니다.')
        }

        if (isNewUserResponse(data)) {
          persistPendingSignup({
            oauthSubject: data.oauthSubject,
            email: data.email,
            name: data.name,
            picture: data.picture,
            next: targetNext
          })
          try {
            alert('신규 이용자입니다! 회원가입 페이지로 이동합니다.')
          } catch {
            // ignore
          }
          const signupRoute = targetNext
            ? `/signup?next=${encodeURIComponent(targetNext)}`
            : '/signup'
          router.replace(signupRoute)
          return
        }
        if (!isExistingUserResponse(data)) {
          throw new Error('알 수 없는 로그인 응답입니다.')
        }

        if (data.user && data.accessToken && data.refreshToken) {
          console.log('[LoginPage] Existing user login success, saving to storage')
          setUser(data.user, data.accessToken, data.refreshToken)
        } else {
          console.warn('[LoginPage] Login success but missing data', {
            hasUser: !!data.user,
            hasAt: !!data.accessToken,
            hasRt: !!data.refreshToken
          })
        }
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem(PENDING_SIGNUP_STORAGE_KEY)
        }

        router.replace(targetNext)
      } catch (err) {
        let message = '로그인 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 403) {
            message =
              (err.response.data as { message?: string })?.message ??
              '인하대학교(@inha.edu) 계정으로만 이용할 수 있습니다.'
          } else if (typeof err.response?.data?.message === 'string') {
            message = err.response.data.message
          }
        } else if (err instanceof Error) {
          message = err.message
        }
        setErrorMessage(message)
      } finally {
        setLoading(false)
      }
    },
    [nextUrl, persistPendingSignup, router, setUser]
  )

  const handleAdminLogin = useCallback(async () => {
    if (!adminId.trim() || !adminPassword.trim()) {
      setErrorMessage('관리자 아이디와 비밀번호를 입력해 주세요.')
      return
    }

    setLoading(true)
    setErrorMessage(null)
    try {
      const response = await loginWithAdminCredentials(adminId.trim(), adminPassword)
      const data = unwrapApiResponse<LoginExistingUserResponse>(response.data)

      if (!data?.user || !data?.accessToken || !data?.refreshToken) {
        throw new Error('관리자 로그인 응답이 올바르지 않습니다.')
      }

      setUser(data.user, data.accessToken, data.refreshToken)
      router.replace(nextUrl)
    } catch (err) {
      let message = '관리자 로그인에 실패했습니다.'
      if (axios.isAxiosError(err)) {
        if (typeof err.response?.data?.message === 'string') {
          message = err.response.data.message
        }
      } else if (err instanceof Error) {
        message = err.message
      }
      setErrorMessage(message)
    } finally {
      setLoading(false)
    }
  }, [adminId, adminPassword, nextUrl, router, setUser])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const hash = window.location.hash
    if (!hash) return
    const params = new URLSearchParams(hash.replace(/^#/, ''))
    const encodedState = params.get('state')
    const parsedState = deserializeState(encodedState)
    const stateNext = parsedState?.next ? getSafeNextUrl(parsedState.next) : null
    if (parsedState?.next) {
      setNextOverride(stateNext)
    }

    const idToken = params.get('id_token')
    const error = params.get('error')

    window.history.replaceState(null, '', window.location.pathname + window.location.search)

    if (idToken) {
      void handleIdTokenLogin(idToken, stateNext ?? undefined)
    } else if (error) {
      setErrorMessage(`Google 로그인 실패: ${error}`)
    }
  }, [handleIdTokenLogin])

  const handleGoogleLogin = useCallback(() => {
    if (!googleClientId) {
      setErrorMessage('Google Client ID가 설정되어 있지 않습니다. 관리자에게 문의해주세요.')
      return
    }

    const redirectUri =
      googleRedirectUri ||
      (typeof window !== 'undefined' ? `${window.location.origin}/login` : '/login')

    const nonce = generateNonce()
    const state = serializeState({ next: nextUrl, ts: Date.now() })
    const scope = encodeURIComponent('openid email profile')
    const url = `${GOOGLE_OIDC_ENDPOINT}?client_id=${encodeURIComponent(
      googleClientId
    )}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=id_token&scope=${scope}&nonce=${encodeURIComponent(
      nonce
    )}&state=${state}&prompt=select_account`

    setErrorMessage(null)
    window.location.href = url
  }, [googleClientId, googleRedirectUri, nextUrl])

  const googleButton = (
    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={!canUseGoogleLogin || loading}
      className="flex w-full items-center justify-center gap-3 rounded-[10px] bg-dusk-ink-100 px-5 py-4 text-[15px] font-semibold text-dusk-card transition-[background-color,transform,box-shadow] duration-200 hover:-translate-y-px hover:bg-white hover:shadow-[0_10px_30px_rgba(0,0,0,0.32)] active:scale-[0.99] disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-dusk-ink-100 disabled:hover:shadow-none"
    >
      <Image
        src="/icons/logo/google-g.svg"
        alt=""
        width={20}
        height={20}
        className="block shrink-0"
      />
      Google 계정으로 로그인
    </button>
  )

  return (
    <>
      <Loader isLoading={loading} />
      <main className="relative flex min-h-[100dvh] flex-col overflow-hidden min-[1024px]:flex-row">
        {/*
          사진 레이어. 모바일에서는 화면 전체를 덮고, 1024px 부터 패널(496px) 왼쪽만 덮는다.
          768px(`pc:`)에서 가르면 사진 자리가 270px 남짓으로 찌그러져 분할 기준을 따로 잡았다.
        */}
        <div aria-hidden className="absolute inset-0 min-[1024px]:right-[496px]">
          <Image
            src={hero.photo.src}
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="object-cover"
            style={{
              objectPosition: `50% ${hero.photo.focusY}%`,
              filter: 'saturate(0.86) contrast(1.02)'
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(178deg, rgba(25,20,30,0.80) 0%, rgba(31,25,36,0.66) 38%, rgba(47,34,37,0.82) 100%)'
            }}
          />
          {/* 모바일은 사진 위에 글이 통째로 앉으므로 아래쪽을 더 눌러 준다. */}
          <div className="absolute inset-0 bg-gradient-to-t from-dusk-base via-dusk-base/85 to-transparent min-[1024px]:hidden" />
          {/* PC 에서만 오른쪽 경계를 배경색에 녹인다. */}
          <div
            className="absolute inset-y-0 right-0 hidden w-[180px] min-[1024px]:block"
            style={{ background: 'linear-gradient(90deg, rgba(27,22,34,0), #1B1622 88%)' }}
          />
        </div>

        <section className="relative z-10 flex flex-1 flex-col justify-between gap-10 px-[clamp(20px,5vw,44px)] pb-8 pt-[clamp(28px,4vw,34px)] min-[1024px]:pb-[38px]">
          {/* 글자만이면 터치 영역이 20px 밖에 안 된다. 음수 여백으로 자리는 그대로 두고 누를 곳만 넓힌다. */}
          <Link
            href="/onboarding"
            className="-mx-2 -my-2 inline-flex min-h-11 items-center self-start px-2 py-2 text-sm text-dusk-ink-300 transition-colors hover:text-dusk-ink-100"
          >
            ← GDGoC INHA
          </Link>

          <div className="max-w-[30ch]">
            <p className="break-keep text-[clamp(20px,4.6vw,30px)] font-semibold leading-[1.38] tracking-[-0.03em] text-balance">
              {hero.description}
            </p>
            <p className="mt-3.5 hidden text-[15px] leading-[1.75] text-dusk-ink-500 min-[1024px]:block">
              인하대학교 Google 개발자 커뮤니티, GDGoC INHA
            </p>
            <div className="mt-6 hidden items-center gap-3 min-[1024px]:flex">
              <span className="h-px w-11 shrink-0 bg-[rgba(240,234,228,0.28)]" />
              <span className="text-[13px] text-dusk-ink-700">{hero.photo.caption}</span>
            </div>
          </div>
        </section>

        <section className="relative z-10 flex flex-col justify-center px-[clamp(20px,5vw,44px)] pb-[clamp(32px,6vw,56px)] min-[1024px]:w-[496px] min-[1024px]:shrink-0 min-[1024px]:px-[clamp(24px,3.6vw,60px)] min-[1024px]:py-14">
          <div className="mx-auto w-full min-[1024px]:max-w-[372px]">
            <div className="flex items-center gap-3">
              <GdgLogo mode="auto" />
              <h1 className="text-[clamp(22px,2.6vw,30px)] font-semibold leading-[1.26] tracking-[-0.03em]">
                로그인
              </h1>
            </div>

            <p className="mt-[26px] text-[clamp(18px,2vw,22px)] font-medium text-dusk-ink-100">
              방문을 환영합니다!
            </p>
            <p className="mt-2.5 break-keep text-[15px] leading-[1.7] text-dusk-ink-600">
              {isDashboardLogin
                ? '대시보드는 CORE 이상 계정으로 접근할 수 있습니다.'
                : 'GDGoC INHA 홈페이지를 이용하려면 로그인하세요.'}
            </p>

            <div className="mt-8">
              {showAdminLogin ? (
                <div className="flex w-full flex-col gap-2.5">
                  <input
                    value={adminId}
                    onChange={(e) => setAdminId(e.target.value)}
                    placeholder="Admin ID"
                    className={DUSK_INPUT}
                  />
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Password"
                    className={DUSK_INPUT}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        void handleAdminLogin()
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => void handleAdminLogin()}
                    disabled={loading}
                    className={cn(DUSK_SUBMIT_BUTTON, 'w-full flex-none')}
                  >
                    Admin 로그인
                  </button>
                </div>
              ) : (
                googleButton
              )}
            </div>

            <div className="mt-5 flex items-center gap-2.5 rounded-lg border border-[rgba(240,234,228,0.10)] bg-[rgba(240,234,228,0.05)] px-3.5 py-3">
              <span className="size-1.5 shrink-0 rounded-full bg-signal-ok" />
              <span className="break-keep text-[13px] leading-[1.6] text-dusk-ink-700">
                {isDashboardLogin ? (
                  showAdminLogin ? (
                    'Google 로그인은 CORE 이상 권한 계정이 필요합니다.'
                  ) : (
                    '관리자 로그인은 쿼리 파라미터(?admin=1)로만 표시됩니다.'
                  )
                ) : (
                  <>
                    <span className="text-dusk-ink-300">@inha.edu</span> 계정만 사용 가능합니다
                  </>
                )}
              </span>
            </div>

            {errorMessage ? (
              <p className="mt-4 break-keep text-[13px] leading-[1.7] text-signal-err">
                {errorMessage}
              </p>
            ) : null}
          </div>
        </section>
      </main>
    </>
  )
}
