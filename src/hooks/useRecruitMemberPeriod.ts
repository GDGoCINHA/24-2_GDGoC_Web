'use client'

import { useEffect, useState } from 'react'

export type RecruitMemberPeriodStatus = 'BEFORE_OPEN' | 'OPEN' | 'CLOSED'

export type RecruitMemberPeriod = {
  openAt: string
  closeAt: string
  status: RecruitMemberPeriodStatus
}

/**
 * 부원 모집 기간을 서버에서 가져온다.
 *
 * useRecruitCorePeriod 와 같은 모양이지만 응답에 session 이 없어 타입을 따로 둔다.
 * 코어 훅을 일반화하지 않은 이유는 그쪽이 이미 여러 곳에서 쓰이고 있어서다.
 *
 * 인증이 필요 없는 공개 GET 이다. 실패해도 화면을 막지 않는다 — 호출부가 `failed` 를
 * 보고 열어두도록 판단하고, 실제 차단은 서버가 제출 시점에 한다.
 */
export function useRecruitMemberPeriod() {
  const [period, setPeriod] = useState<RecruitMemberPeriod | null>(null)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let active = true

    const fetchPeriod = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/recruit/member/period`)
        if (!response.ok) throw new Error(`status ${response.status}`)

        const body = await response.json()
        if (!active) return

        // 응답이 { code, message, data } 로 감싸여 올 수도, 평평하게 올 수도 있다.
        const payload = body?.data ?? body
        if (!payload?.status) throw new Error('status 없음')

        setPeriod(payload as RecruitMemberPeriod)
      } catch (error) {
        if (!active) return
        console.error('[부원 리크루팅] 모집 기간을 불러오지 못했습니다.', error)
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
