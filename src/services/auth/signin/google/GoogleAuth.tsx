'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

import Loader from '@/components/ui/common/Loader'

import { useAuth } from '@/hooks/useAuth'
import { unwrapApiResponse } from '@/utils/api/unwrap'

import { exchangeGoogleToken } from '@/services/auth/signin/google/GoogleAuthApi'

export const GoogleAuthComponent = () => {
  const { setUser } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    const decodedCode = searchParams.get('code')
    if (!decodedCode) {
      setIsLoading(false)
      return
    }

    const code = encodeURIComponent(decodedCode)
    const rawState = searchParams.get('state')
    let nextPath = null
    if (rawState) {
      try {
        const decodedState = decodeURIComponent(rawState)
        if (decodedState.startsWith('/') && !decodedState.startsWith('//')) {
          nextPath = decodedState
        }
      } catch {
        if (rawState.startsWith('/') && !rawState.startsWith('//')) {
          nextPath = rawState
        }
      }
    }

    exchangeGoogleToken(code)
      .then((res) => {
        const data = unwrapApiResponse<Record<string, unknown>>(res?.data) || {}
        const exists = typeof data.exists === 'boolean' ? data.exists : data.isExists
        const email = typeof data.email === 'string' ? data.email : ''
        const name = typeof data.name === 'string' ? data.name : ''
        const user = (data.user ?? null) as Record<string, unknown> | null
        if (exists) {
          if (user) {
            setUser(user)
          }
          router.push(nextPath || '/main')
        } else {
          alert('회원 정보가 없습니다. 회원가입을 완료해주세요.')
          sessionStorage.setItem('signup_email', email)
          sessionStorage.setItem('signup_name', name)
          router.push('/auth/signup')
        }
      })
      .catch(() => {
        alert('구글 로그인 실패! 다시 시도해주세요.')
        if (nextPath) {
          router.push(`/login?next=${encodeURIComponent(nextPath)}`)
        } else {
          router.push('/login')
        }
      })
      .finally(() => setIsLoading(false))
  }, [searchParams, router, setUser])

  if (isLoading) {
    return <Loader isLoading={true} />
  }
  return null
}

export const GoogleAuth = () => (
  <Suspense fallback={<Loader isLoading={true} />}>
    <GoogleAuthComponent />
  </Suspense>
)
