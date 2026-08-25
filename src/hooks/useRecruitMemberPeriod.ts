'use client'

import { useEffect, useState } from 'react'

import type { RecruitScheduleNotice } from '@/constant/recruitSchedule'

export type RecruitMemberPeriodStatus = 'BEFORE_OPEN' | 'OPEN' | 'CLOSED'

export type RecruitMemberPeriod = {
  openAt: string
  closeAt: string
  status: RecruitMemberPeriodStatus
  /** 화면에만 쓰는 안내 일정. 예전 서버에는 없으므로 없을 수 있다. */
  notice?: RecruitScheduleNotice | null
}

/**
 * 한 화면에서 여러 컴포넌트가 이 훅을 쓴다. 훅마다 따로 요청하면 첫 화면에서 같은 GET 이
 * 여러 번 나가므로 진행 중인 요청을 나눠 쓴다. 새로 고치기 전까지는 같은 값을 본다 —
 * 모집 기간은 보는 동안 바뀌는 값이 아니고, 실제 차단은 서버가 제출 시점에 한다.
 */
let inflight: Promise<unknown> | null = null

const load = (): Promise<unknown> => {
  inflight ??= (async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/recruit/member/period`)
    if (!response.ok) throw new Error(`status ${response.status}`)

    const body = await response.json()
    // 응답이 { code, message, data } 로 감싸여 올 수도, 평평하게 올 수도 있다.
    return body?.data ?? body
  })().catch((error) => {
    // 실패한 약속을 남겨두면 다시 열어도 계속 실패한다.
    inflight = null
    throw error
  })

  return inflight
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
        const payload = (await load()) as RecruitMemberPeriod | undefined
        if (!active) return
        if (!payload?.status) throw new Error('status 없음')

        setPeriod(payload)
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
