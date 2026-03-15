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
    throw new Error('빙고 순위를 불러오지 못했습니다.')
  }

  const payload = unwrapApiResponse<TeamRankingEntry[]>(await response.json())
  return Array.isArray(payload) ? payload : []
}

export default function BingoIndexPage() {
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
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff7ee_0%,#f8e7dc_46%,#f3ddd5_100%)] px-4 py-8 text-[#4f382d] sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="overflow-hidden rounded-[2.5rem] border border-[#f0ddd1] bg-[linear-gradient(135deg,rgba(255,252,248,0.92),rgba(250,239,232,0.94))] p-6 shadow-[0_30px_90px_rgba(121,72,53,0.12)] backdrop-blur sm:p-8 lg:p-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="typo-c1 font-(family-name:--font-dunggeunmo) tracking-[0.32em] text-[#c98372]">
                GDGoC INHA 2026
              </p>
              <h1 className="typo-gsf-h1 text-[#5f7657]">Bingo Lobby</h1>
              <p className="typo-b2 max-w-2xl text-[#7a5d4e]">
                팀을 선택하면 각 팀 빙고판으로 이동합니다. 아래 순위는 현재 저장된 체크 칸 수
                기준입니다.
              </p>
            </div>
            <div className="typo-b3 rounded-[1.75rem] border border-[#edd6c7] bg-[#fff9f3] px-5 py-4 text-[#7a5d4e] shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]">
              총{' '}
              <span className="typo-gsf-s1 font-(family-name:--font-ocra) text-[#cf7e6c]">
                10 Teams
              </span>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-[#f0ddd1] bg-[rgba(255,250,245,0.88)] p-5 shadow-[0_24px_70px_rgba(92,53,35,0.1)]">
          <div className="flex items-center justify-between gap-4">
            <h2 className="typo-gsf-h4 text-[#c98372]">체크 순위</h2>
            <span className="typo-c1 text-[#8a6b5c]">local ranking</span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {rankings.map((entry) => (
              <div
                key={entry.teamNumber}
                className="rounded-[1.25rem] border border-[#eedacd] bg-[#fff9f4] px-4 py-4"
              >
                <p className="typo-c1 font-(family-name:--font-dunggeunmo) text-[#cf7e6c]">
                  #{entry.rank}
                </p>
                <p className="typo-gsf-s1 mt-2 text-[#5f7657]">TEAM {entry.teamNumber}</p>
                <p className="typo-b3 mt-1 text-[#7a5d4e]">{entry.checkedCount}칸</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {TEAM_NUMBERS.map((teamNumber) => {
            const ranking = rankingMap.get(teamNumber)

            return (
              <Link
                key={teamNumber}
                href={`/event/2026/bingo/${teamNumber}`}
                className="group relative overflow-hidden rounded-[1.5rem] border border-[#edd8cb] bg-[radial-gradient(circle_at_top_left,rgba(255,254,252,0.96),rgba(251,239,231,0.96))] p-5 shadow-[0_24px_70px_rgba(92,53,35,0.1)] transition duration-200 hover:-translate-y-1"
              >
                <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#f7d8d0]/70 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-10 -left-8 h-28 w-28 rounded-full bg-[#dce8d2]/70 blur-2xl" />
                <div className="relative flex flex-col gap-5">
                  <div className="flex items-start justify-between gap-4">
                    <span className="typo-c1 rounded-[1rem] bg-[#fff4ec] px-4 py-2 font-(family-name:--font-dunggeunmo) text-[#cf7e6c] shadow-[0_10px_24px_rgba(120,72,46,0.06)]">
                      TEAM {teamNumber}
                    </span>
                    <span className="typo-c1 rounded-[1rem] border border-[#d9e4cf] bg-[#f3f8ec] px-3 py-2 text-[#5f7657]">
                      {ranking ? `#${ranking.rank}` : '-'}
                    </span>
                  </div>
                  <p className="typo-b2 text-[#7a5d4e]">
                    {ranking ? `${ranking.checkedCount}칸 체크` : '기록 없음'}
                  </p>
                  <div className="flex items-center justify-between rounded-[1rem] border border-[#d9e4cf] bg-[linear-gradient(135deg,#fff4ec_0%,#f3f8ec_100%)] px-4 py-3">
                    <span className="typo-b3 text-[#7a5d4e]">팀 빙고판 열기</span>
                    <span className="typo-b3 text-[#5f7657] transition group-hover:translate-x-1">
                      입장
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </section>
      </div>
    </main>
  )
}
