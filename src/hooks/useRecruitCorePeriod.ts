'use client'

import { useEffect, useState } from 'react'

export type RecruitCorePeriodStatus = 'BEFORE_OPEN' | 'OPEN' | 'CLOSED'

export type RecruitCorePeriod = {
  session: string
  openAt: string
  closeAt: string
  status: RecruitCorePeriodStatus
}

/**
 * 코어 모집 기간을 서버에서 가져온다.
 *
 * 인증이 필요 없는 공개 GET 이므로 authorizedClient 를 쓰지 않는다.
 * 실패해도 화면을 막지 않는다 — 호출부가 `failed` 를 보고 열어두도록 판단한다.
 */
export function useRecruitCorePeriod() {
  const [period, setPeriod] = useState<RecruitCorePeriod | null>(null)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let active = true

    const fetchPeriod = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/recruit/core/period`)
        if (!response.ok) throw new Error(`status ${response.status}`)

        const body = await response.json()
        if (!active) return

        // 응답이 { code, message, data } 로 감싸여 올 수도, 평평하게 올 수도 있다.
        const payload = body?.data ?? body
        if (!payload?.status) throw new Error('status 없음')

        setPeriod(payload as RecruitCorePeriod)
      } catch (error) {
        if (!active) return
        console.error('[코어 리크루팅] 모집 기간을 불러오지 못했습니다.', error)
        setFailed(true)
      } finally {
        if (active) setLoading(false)
      }
    }

    void fetchPeriod()

    return () => {
      active = false
    }
  }, [])

  return { period, loading, failed }
}
