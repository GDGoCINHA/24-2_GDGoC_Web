'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { Button } from '@nextui-org/react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'

import Loader from '@/components/ui/common/Loader'
import { GdgLogo } from '@/components/ui/design-system'
import { useAuth } from '@/hooks/useAuth'
import {
  type LoginApiResponseBody,
  type LoginExistingUserResponse,
  type LoginNewUserResponse,
  loginWithGoogleIdToken
} from '@/services/auth/authClient'
import { PENDING_SIGNUP_STORAGE_KEY, type PendingSignupPayload } from '@/constant/auth'
import { unwrapApiResponse } from '@/utils/api/unwrap'

const DEFAULT_FALLBACK_ROUTE = '/main'

const getSafeNextUrl = (raw: string | null): string => {
  if (!raw) return DEFAULT_FALLBACK_ROUTE

  try {
    const decoded = decodeURIComponent(raw)
    return decoded.startsWith('/') ? decoded : DEFAULT_FALLBACK_ROUTE
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

        if (data.user) {
          setUser(data.user)
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

  const getGoogleButtonSizeClassName = (mode: 'auto' | 'pc' | 'mobile' = 'auto') => {
    if (mode === 'pc') return 'w-[300px] h-[52px]'
    if (mode === 'mobile') return 'w-[260px] h-[46px]'
    return 'w-[260px] h-[46px] pc:w-[300px] pc:h-[52px]'
  }

  const GoogleLoginButton = ({ mode = 'auto' }: { mode?: 'auto' | 'pc' | 'mobile' }) => (
    <Button
      onPress={() => {
        if (!loading) {
          handleGoogleLogin()
        }
      }}
      isDisabled={!canUseGoogleLogin || loading}
      className={`mx-auto flex items-center justify-center gap-4 rounded-full border border-[#747775] bg-white text-[14px] font-semibold leading-[20px] text-[#1f1f1f] shadow-[0_5px_35px_rgba(18,18,18,0.05)] ${getGoogleButtonSizeClassName(mode)}`}
    >
      <Image src="/icons/logo/google-g.svg" alt="Google logo" height={20} width={20} />
      <span>Google 계정으로 로그인</span>
    </Button>
  )

  const RenderPcView = () => (
    <div className="mx-auto flex min-h-screen w-full max-w-[1128px] flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-[550px] space-y-6">
        <div className="flex items-center gap-3">
          <GdgLogo mode="pc" variant="long" priority />
        </div>
        <div className="rounded-[20px] border border-[#f0f0f0] bg-[#1e1e1e] px-10 py-14 text-white shadow-[0_0_12px_rgba(250,250,250,0.25)]">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="space-y-2 text-center">
              <p className="text-[24px] font-extrabold leading-[34px] text-[#f0f0f0]">
                방문을 환영합니다!
              </p>
              <p className="text-[14px] font-medium leading-[20px] text-[#f0f0f0]">
                GDGoC INHA 홈페이지를 이용하려면 로그인하세요.
              </p>
            </div>
            <GoogleLoginButton />
            <div className="space-y-1 text-[12px] font-medium leading-[16px] text-[#b2b2b2]">
              <p>@inha.edu 계정만 사용 가능합니다</p>
              {errorMessage ? <p className="text-[#ff6d6d]">{errorMessage}</p> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const RenderMobileView = () => (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-16 text-white">
      <div className="w-full max-w-[343px] space-y-4">
        <div className="flex items-center gap-2">
          <GdgLogo mode="mobile" variant="long" />
        </div>
        <div className="rounded-[20px] border border-[#f0f0f0] bg-[#1e1e1e] px-[41px] py-10 text-white shadow-[0_0_12px_rgba(250,250,250,0.25)]">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="space-y-2 text-center">
              <p className="text-[18px] font-extrabold leading-[26px] text-[#f0f0f0]">
                방문을 환영합니다!
              </p>
              <p className="text-[11px] font-medium leading-[14px] text-[#f0f0f0]">
                GDGoC INHA 홈페이지를 이용하려면 로그인하세요.
              </p>
            </div>
            <GoogleLoginButton mode="mobile" />
            <div className="space-y-1 text-[11px] font-medium leading-[14px] text-[#b2b2b2]">
              <p>@inha.edu 계정만 사용 가능합니다</p>
              {errorMessage ? <p className="text-[#ff6d6d]">{errorMessage}</p> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <Loader isLoading={loading} />
      <div className="min-h-screen bg-[#1e1e1e] text-white">
        <div className="hidden pc:block">
          <RenderPcView />
        </div>
        <div className="block pc:hidden">
          <RenderMobileView />
        </div>
      </div>
    </>
  )
}
