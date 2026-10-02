'use client'

import { useCallback, useEffect, useState } from 'react'

import { formatActivityDate } from '@/components/club/clubDate'
import { DUSK_GHOST_BUTTON, DUSK_PRIMARY_BUTTON } from '@/components/ui/dusk/DuskForm'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import {
  acceptFixRequest,
  fetchFixRequests,
  rejectFixRequest
} from '@/services/club/attendanceClient'
import { readClubError } from '@/services/club/clubClient'
import type { ClubFixRequest } from '@/types/club'
import { cn } from '@/utils/cn'

const SMALL = 'px-4 py-2 text-[13px]'

const label = (attended: boolean) => (attended ? '출석' : '결석')

/** 수락할 수 없는 이유. 없으면 수락할 수 있다. 거절은 언제나 된다. */
const blockedReason = (request: ClubFixRequest): string | null => {
  if (request.activityStatus === 'APPROVED') return '인증 완료된 기록이라 고칠 수 없어요.'
  if (request.currentAttended == null) return '활동일이 바뀌어 명단에 없어요. 거절해 주세요.'
  return null
}

/**
 * 리더 관리 화면의 「출석 수정 요청」 섹션 (B 담당). A 의 `/club/manage` 페이지에 들어간다.
 *
 * 반영하면 출석이 요청한 값이 되고, 그 활동 기록은 다시 확인 중이 돼 운영진이 다시 본다.
 */
export function ClubFixRequestSection({ clubId }: { clubId: number }) {
  const { apiClient } = useAuthenticatedApi()
  const [requests, setRequests] = useState<ClubFixRequest[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  /** 처리 중인 요청. 버튼을 두 번 눌러 요청이 겹치지 않게 한다. */
  const [working, setWorking] = useState<number | null>(null)

  const load = useCallback(() => {
    if (!clubId) return
    fetchFixRequests(apiClient, clubId)
      .then((data) => {
        setRequests(data)
        setError(null)
      })
      .catch((err) => setError(readClubError(err, '출석 수정 요청을 불러오지 못했어요.')))
  }, [apiClient, clubId])

  useEffect(load, [load])

  const handle = async (request: ClubFixRequest, accept: boolean) => {
    const confirmText = accept
      ? `${request.userName}님의 출석을 ${label(request.requestedAttended)}(으)로 바꿀까요? 그 기록은 다시 검토 중이 돼요.`
      : `${request.userName}님의 요청을 거절할까요?`
    if (!window.confirm(confirmText)) return
    setWorking(request.id)
    try {
      if (accept) {
        await acceptFixRequest(apiClient, request.id)
      } else {
        await rejectFixRequest(apiClient, request.id)
      }
      load()
    } catch (err) {
      window.alert(readClubError(err))
      load()
    } finally {
      setWorking(null)
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">
        출석 수정 요청 <span className="text-ember">{requests?.length ?? ''}</span>
      </h2>

      {error && <p className="text-sm text-signal-err">{error}</p>}
      {!error && !requests && <p className="text-sm text-dusk-ink-800">불러오는 중…</p>}
      {requests?.length === 0 && <p className="text-sm text-dusk-ink-800">처리할 요청이 없어요.</p>}

      {requests?.map((request) => {
        const blocked = blockedReason(request)
        const from = request.currentAttended == null ? '명단 없음' : label(request.currentAttended)
        return (
          <div
            key={request.id}
            className="flex flex-wrap items-center gap-3.5 rounded-[14px] border border-dusk-line px-[18px] py-4"
          >
            <div className="min-w-0 flex-[1_1_300px]">
              <div className="text-[15px] font-semibold">
                {request.userName}{' '}
                <span className="text-[13px] font-normal text-dusk-ink-800">
                  {formatActivityDate(request.activityDate)} 모임 · {from} →{' '}
                  {label(request.requestedAttended)}
                </span>
              </div>
              {request.reason && (
                <div className="mt-1.5 whitespace-pre-line text-sm text-dusk-ink-400">
                  {request.reason}
                </div>
              )}
              {blocked && <div className="mt-1.5 text-[13px] text-tag-event">{blocked}</div>}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={working === request.id}
                onClick={() => void handle(request, false)}
                className={cn(DUSK_GHOST_BUTTON, SMALL)}
              >
                거절
              </button>
              <button
                type="button"
                disabled={working === request.id || blocked !== null}
                onClick={() => void handle(request, true)}
                className={cn(DUSK_PRIMARY_BUTTON, SMALL, 'disabled:opacity-50')}
              >
                반영
              </button>
            </div>
          </div>
        )
      })}

      <p className="text-[13px] text-dusk-ink-800">
        반영하면 그 활동 기록은 다시 검토 중이 돼요. 인증 완료된 기록은 고칠 수 없어요.
      </p>
    </section>
  )
}
