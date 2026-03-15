'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

import { unwrapApiResponse } from '@/utils/api/unwrap'

const TEAM_NUMBERS = Array.from({ length: 10 }, (_, index) => index + 1)
const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_API_URL

type TeamRankingEntry = {
  teamNumber: number
  checkedCount: number
  rank: number
}

async function fetchRankings() {
  if (!API_BASE_URL) {
    return []
  }

  const response = await fetch(`${API_BASE_URL}/game/bingo/boards`, {
    credentials: 'include',
    cache: 'no-store'
  })

  if (!response.ok) {
    throw new Error('빙고 현황을 불러오지 못했습니다.')
  }

  const payload = unwrapApiResponse<TeamRankingEntry[]>(await response.json())
  return Array.isArray(payload) ? payload : []
}

export default function DashboardBingoPage() {
  const [rankings, setRankings] = useState<TeamRankingEntry[]>([])

  useEffect(() => {
    let isMounted = true

    const loadRankings = async () => {
      try {
        const nextRankings = await fetchRankings()
        if (isMounted) {
          setRankings(nextRankings)
        }
      } catch {
        if (isMounted) {
          setRankings([])
        }
      }
    }

    void loadRankings()
    const intervalId = window.setInterval(() => {
      void loadRankings()
    }, 10000)

    return () => {
      isMounted = false
      window.clearInterval(intervalId)
    }
  }, [])

  const rankingMap = useMemo(
    () => new Map(rankings.map((entry) => [entry.teamNumber, entry])),
    [rankings]
  )

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white pc:px-10">
      <div className="mx-auto w-full max-w-[1280px] space-y-8">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-2">
            <p className="typo-pc-c2 text-gray-700">Admin Dashboard</p>
            <h1 className="typo-h3 mobile:typo-m-h2">Bingo 관리</h1>
            <p className="typo-pc-b3 text-gray-700">
              팀을 선택하면 대시보드 안에서 빙고 체크를 수정할 수 있습니다.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-xl border border-white/10 px-4 py-2 typo-pc-b3 text-gray-700 transition hover:border-white/30 hover:text-white"
          >
            대시보드로
          </Link>
        </div>

        <div className="grid gap-4 pc:grid-cols-2">
          {TEAM_NUMBERS.map((teamNumber) => {
            const ranking = rankingMap.get(teamNumber)

            return (
              <Link
                key={teamNumber}
                href={`/dashboard/bingo/${teamNumber}`}
                className="group rounded-2xl border border-white/10 bg-gray-100/30 p-5 transition hover:border-white/40 hover:bg-white/5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="typo-pc-c2 text-gray-700">TEAM {teamNumber}</p>
                    <h2 className="typo-pc-h4 text-white">
                      {ranking ? `${ranking.checkedCount}칸 체크` : '기록 없음'}
                    </h2>
                    <p className="typo-pc-b3 text-gray-700">
                      {ranking ? `현재 ${ranking.rank}위` : '아직 랭킹 데이터가 없습니다.'}
                    </p>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 typo-pc-c2 text-gray-700 transition group-hover:border-white/30 group-hover:text-white">
                    수정
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}
