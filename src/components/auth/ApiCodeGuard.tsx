'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import { AuthorizedFetchProvider } from '@/context/AuthorizedFetchProvider'
import Loader from '@/components/ui/common/Loader'

const toInternalPath = (raw: string): string => {
  if (raw.startsWith('/') && !raw.startsWith('//')) return raw

  if (typeof window !== 'undefined') {
    try {
      const parsed = new URL(raw, window.location.origin)
      if (parsed.origin === window.location.origin) {
        return `${parsed.pathname}${parsed.search}${parsed.hash}`
      }
    } catch {
      return '/'
    }
  }

  return '/'
}

/**
 * ApiCodeGuard
 * - /auth/{role}?next=<...>&team=<...>(옵션) 호출해 200(또는 body.code=200)이면 통과
 * - 아니면 로그인(/login?next=...)으로 보냄
 *
 * props:
 *  - requiredRole: 'GUEST'|'MEMBER'|'CORE'|'LEAD'|'ORGANIZER'|'ADMIN'
 *  - requiredTeam?: 'HR'|'BD'|'TECH'|'PR_DESIGN' (옵션, 주어질 때만 쿼리에 포함)
 *  - nextOverride?: string
 *  - children: ReactNode
 */
export default function ApiCodeGuard({ requiredRole, requiredTeam = '', nextOverride, children }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { apiClient, authorizedFetch } = useAuthenticatedApi()

  const [checking, setChecking] = useState(true)
  const [allowed, setAllowed] = useState(false)

  // next URL 계산 (override > 현재 경로)
  const nextUrl = useMemo(() => {
    if (nextOverride) return encodeURIComponent(toInternalPath(nextOverride))
    const q = searchParams?.toString()
    return encodeURIComponent(`${pathname}${q ? `?${q}` : ''}`)
  }, [nextOverride, pathname, searchParams])

  const cancelledRef = useRef(false)

  useEffect(() => {
    if (!requiredRole) {
      // 역할이 없으면 바로 차단
      router.replace(`/login?next=${nextUrl}`)
      return
    }

    cancelledRef.current = false

    const verify = async () => {
      try {
        // ✅ 권한 체크: /auth/{role}?next=... (&team=... 은 전달된 경우에만)
        const params: { next: string; team?: string } = { next: decodeURIComponent(nextUrl) }
        if (requiredTeam) params.team = requiredTeam

        const res = await apiClient.get(`/auth/${requiredRole}`, { params })

        if (cancelledRef.current) return

        const okHttp = res?.status === 200 || res?.status === 204
        const okBody = (res?.data?.code ?? 200) === 200

        if (okHttp && okBody) {
          setAllowed(true)
        } else {
          router.replace(`/login?next=${nextUrl}`)
        }
      } catch {
        if (!cancelledRef.current) {
          router.replace(`/login?next=${nextUrl}`)
        }
      } finally {
        if (!cancelledRef.current) setChecking(false)
      }
    }

    void verify()

    return () => {
      cancelledRef.current = true
    }
  }, [apiClient, requiredRole, requiredTeam, nextUrl, router])

  if (checking) return <Loader isLoading />
  if (!allowed) return null
  return <AuthorizedFetchProvider fetcher={authorizedFetch}>{children}</AuthorizedFetchProvider>
}
