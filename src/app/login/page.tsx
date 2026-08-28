'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { useRouter, useSearchParams } from 'next/navigation'

import Loader from '@/components/ui/common/Loader'
import { GdgGoogleLoginButton, GdgLogo } from '@/components/ui/design-system'
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

  /** 구글 버튼은 폭이 고정이라 CSS 로 줄일 수 없다. 화면별로 갈라 렌더한다. */
  const googleButton = (
    <>
      <div className="hidden pc:block">
        <GdgGoogleLoginButton
          device="pc"
          onClick={handleGoogleLogin}
          disabled={!canUseGoogleLogin || loading}
          loading={loading}
        />
      </div>
      <div className="block pc:hidden">
        <GdgGoogleLoginButton
          device="mobile"
          onClick={handleGoogleLogin}
          disabled={!canUseGoogleLogin || loading}
          loading={loading}
        />
      </div>
    </>
  )

  return (
    <>
      <Loader isLoading={loading} />
      <main className="mx-auto flex min-h-screen w-full max-w-[520px] flex-col justify-center px-[clamp(20px,5vw,44px)] py-16">
        <div className="flex items-center gap-3">
          <GdgLogo mode="auto" />
          <h1 className="text-[clamp(22px,2.6vw,30px)] font-semibold leading-[1.26] tracking-[-0.03em]">
            로그인
          </h1>
        </div>

        <section className="mt-7 rounded-[18px] border border-[rgba(240,234,228,0.12)] px-[clamp(20px,4vw,36px)] py-[clamp(32px,5vw,44px)]">
          <div className="text-center">
            <p className="text-[clamp(18px,2vw,22px)] font-medium text-dusk-ink-100">
              방문을 환영합니다!
            </p>
            <p className="mt-2.5 break-keep text-[15px] leading-[1.7] text-dusk-ink-600">
              {isDashboardLogin
                ? '대시보드는 CORE 이상 계정으로 접근할 수 있습니다.'
                : 'GDGoC INHA 홈페이지를 이용하려면 로그인하세요.'}
            </p>
          </div>

          <div className="mt-8 flex flex-col items-center gap-3.5">
            {showAdminLogin ? (
              <div className="flex w-full max-w-[300px] flex-col gap-2.5">
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

            <p className="text-center text-[13px] leading-[1.7] text-dusk-ink-800">
              {isDashboardLogin
                ? showAdminLogin
                  ? 'Google 로그인은 CORE 이상 권한 계정이 필요합니다.'
                  : '관리자 로그인은 쿼리 파라미터(?admin=1)로만 표시됩니다.'
                : '@inha.edu 계정만 사용 가능합니다'}
            </p>
            {errorMessage ? (
              <p className="text-center text-[13px] leading-[1.7] text-signal-err">
                {errorMessage}
              </p>
            ) : null}
          </div>
        </section>
      </main>
    </>
  )
}
