'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import { unwrapApiResponse } from '@/utils/api/unwrap'

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_API_URL

type Rhythm8BeatScoreRow = {
  rank: number
  id: number
  phoneNumber: string
  nickname: string
  score: number
  stageReached: number
  createdAt: string
  updatedAt: string
}

const formatDateTime = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(date)
}

export default function Dashboard8BitPage() {
  const { authorizedFetch } = useAuthenticatedApi()
  const [scores, setScores] = useState<Rhythm8BeatScoreRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadScores = async () => {
      if (!API_BASE_URL) {
        if (isMounted) {
          setScores([])
          setError('API 기본 주소가 설정되지 않았습니다.')
          setIsLoading(false)
        }
        return
      }

      try {
        const response = await authorizedFetch(`${API_BASE_URL}/admin/game/rythm8beat/scores`, {
          cache: 'no-store'
        })

        if (!response.ok) {
          throw new Error('8bit 순위표를 불러오지 못했습니다.')
        }

        const nextScores = unwrapApiResponse<Rhythm8BeatScoreRow[]>(await response.json())

        if (isMounted) {
          setScores(Array.isArray(nextScores) ? nextScores : [])
          setError(null)
        }
      } catch {
        if (isMounted) {
          setError('8bit 순위표를 불러오지 못했습니다.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadScores()

    const intervalId = window.setInterval(() => {
      void loadScores()
    }, 10000)

    return () => {
      isMounted = false
      window.clearInterval(intervalId)
    }
  }, [authorizedFetch])

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white pc:px-10">
      <div className="mx-auto w-full max-w-[1480px] space-y-8">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-2">
            <p className="typo-pc-c2 text-gray-700">Admin Dashboard</p>
            <h1 className="typo-h3 mobile:typo-m-h2">8bit 게임 순위표</h1>
            <p className="typo-pc-b3 text-gray-700">
              저장된 8bit 게임 점수 전체 행을 조회합니다. 10초마다 자동 새로고침됩니다.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-xl border border-white/10 px-4 py-2 typo-pc-b3 text-gray-700 transition hover:border-white/30 hover:text-white"
          >
            대시보드로
          </Link>
        </div>

        <div className="rounded-xl border border-white/10 bg-gray-100/30 p-4">
          <p className="typo-pc-b3 text-gray-700">
            총 {scores.length}건
            {isLoading ? ' / 불러오는 중' : ''}
          </p>
        </div>

        {error ? (
          <div className="rounded-xl border border-red bg-red-400/30 p-4 typo-pc-b3 text-red">
            {error}
          </div>
        ) : null}

        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[1180px] border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-3 typo-pc-b3 text-gray-700">Rank</th>
                <th className="px-4 py-3 typo-pc-b3 text-gray-700">ID</th>
                <th className="px-4 py-3 typo-pc-b3 text-gray-700">닉네임</th>
                <th className="px-4 py-3 typo-pc-b3 text-gray-700">전화번호</th>
                <th className="px-4 py-3 typo-pc-b3 text-gray-700">점수</th>
                <th className="px-4 py-3 typo-pc-b3 text-gray-700">도달 스테이지</th>
                <th className="px-4 py-3 typo-pc-b3 text-gray-700">생성 시각</th>
                <th className="px-4 py-3 typo-pc-b3 text-gray-700">수정 시각</th>
              </tr>
            </thead>
            <tbody>
              {scores.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center typo-pc-b3 text-gray-700">
                    {isLoading ? '순위표를 불러오는 중입니다.' : '저장된 점수가 없습니다.'}
                  </td>
                </tr>
              ) : (
                scores.map((score) => (
                  <tr key={score.id} className="border-t border-white/10 bg-black">
                    <td className="px-4 py-3 typo-pc-b3">{score.rank}</td>
                    <td className="px-4 py-3 typo-pc-b3">{score.id}</td>
                    <td className="px-4 py-3 typo-pc-b3">{score.nickname}</td>
                    <td className="px-4 py-3 typo-pc-b3">{score.phoneNumber}</td>
                    <td className="px-4 py-3 typo-pc-b3">{score.score}</td>
                    <td className="px-4 py-3 typo-pc-b3">{score.stageReached}</td>
                    <td className="px-4 py-3 typo-pc-b3">{formatDateTime(score.createdAt)}</td>
                    <td className="px-4 py-3 typo-pc-b3">{formatDateTime(score.updatedAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
