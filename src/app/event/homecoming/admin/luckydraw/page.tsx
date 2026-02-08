'use client'

import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const clampDrawCount = (value) => {
  const parsed = parseInt(value, 10)
  const safe = Number.isNaN(parsed) ? 1 : parsed
  return Math.min(Math.max(safe, 1), 50)
}

const formatKoreanTime = (dateStr) => {
  if (!dateStr) {
    return '-'
  }
  try {
    return new Intl.DateTimeFormat('ko-KR', {
      hour12: false,
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateStr))
  } catch (err) {
    return dateStr
  }
}

export default function LuckyDrawAdminPage() {
  const { apiClient } = useAuthenticatedApi()
  const [entriesCount, setEntriesCount] = useState(0)
  const [winners, setWinners] = useState([])
  const [drawCount, setDrawCount] = useState('1')
  const [isLoading, setIsLoading] = useState(true)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [error, setError] = useState('')
  const [recentWinnerIds, setRecentWinnerIds] = useState([])
  const statusTimerRef = useRef(null)
  const highlightTimerRef = useRef(null)

  const fetchEntriesCount = useCallback(async () => {
    try {
      const res = await apiClient.get('/guestbook/entries')
      const list = res?.data?.data ?? []
      setEntriesCount(Array.isArray(list) ? list.length : 0)
    } catch (err) {
      console.error('참가자 목록 조회 실패', err)
      throw err
    }
  }, [apiClient])

  const fetchWinners = useCallback(async () => {
    try {
      const res = await apiClient.get('/guestbook/lucky-draw/winners')
      const list = res?.data?.data ?? []
      setWinners(Array.isArray(list) ? list : [])
    } catch (err) {
      console.error('당첨자 목록 조회 실패', err)
      throw err
    }
  }, [apiClient])

  const refreshAll = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      await Promise.all([fetchEntriesCount(), fetchWinners()])
    } catch (err) {
      setError('데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }, [fetchEntriesCount, fetchWinners])

  useEffect(() => {
    refreshAll()
  }, [refreshAll])

  useEffect(
    () => () => {
      if (statusTimerRef.current) {
        clearTimeout(statusTimerRef.current)
      }
      if (highlightTimerRef.current) {
        clearTimeout(highlightTimerRef.current)
      }
    },
    []
  )

  const scheduleStatusClear = useCallback(() => {
    if (statusTimerRef.current) {
      clearTimeout(statusTimerRef.current)
    }
    statusTimerRef.current = setTimeout(() => setStatusMessage(''), 2500)
  }, [])

  const highlightRecent = useCallback((ids) => {
    if (highlightTimerRef.current) {
      clearTimeout(highlightTimerRef.current)
    }
    if (!ids.length) {
      setRecentWinnerIds([])
      return
    }
    setRecentWinnerIds(ids)
    highlightTimerRef.current = setTimeout(() => setRecentWinnerIds([]), 4000)
  }, [])

  const handleDraw = async (event) => {
    event.preventDefault()
    const sanitized = clampDrawCount(drawCount)
    setDrawCount(String(sanitized))
    setIsDrawing(true)
    setError('')
    try {
      const res = await apiClient.post('/guestbook/lucky-draw', { count: sanitized })
      const newWinners = res?.data?.data ?? []
      highlightRecent(newWinners.map((winner) => winner.id))
      setStatusMessage(`${sanitized}명의 당첨자를 추첨했습니다.`)
      scheduleStatusClear()
      await Promise.all([fetchWinners(), fetchEntriesCount()])
    } catch (err) {
      console.error('럭키드로우 추첨 실패', err)
      const message = err?.response?.data?.message || '추첨에 실패했습니다.'
      setError(message)
    } finally {
      setIsDrawing(false)
    }
  }

  const handleReset = async () => {
    if (typeof window !== 'undefined' && !window.confirm('정말로 당첨자 목록을 초기화할까요?')) {
      return
    }
    setIsResetting(true)
    setError('')
    try {
      await apiClient.post('/guestbook/lucky-draw/reset')
      setStatusMessage('당첨자 목록을 초기화했습니다.')
      highlightRecent([])
      scheduleStatusClear()
      await fetchWinners()
    } catch (err) {
      console.error('럭키드로우 리셋 실패', err)
      const message = err?.response?.data?.message || '초기화에 실패했습니다.'
      setError(message)
    } finally {
      setIsResetting(false)
    }
  }

  const sortedWinners = useMemo(() => {
    const getTimeValue = (value) => {
      const timestamp = value ? new Date(value).getTime() : 0
      return Number.isNaN(timestamp) ? 0 : timestamp
    }
    return [...winners].sort((a, b) => getTimeValue(b.wonAt) - getTimeValue(a.wonAt))
  }, [winners])

  const recentCount = sortedWinners.length

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDF4FF] via-[#F8FBFF] to-[#F0F9FF] text-slate-900 px-4 py-10">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between bg-white/70 rounded-3xl border border-slate-200 p-6 shadow-lg shadow-slate-100">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Lucky Draw</p>
            <h1 className="text-3xl font-semibold mt-1 text-slate-900">
              GDGoC Homecoming 럭키드로우
            </h1>
            <p className="text-slate-600 mt-2">
              실시간 참가자 {entriesCount}명 · 당첨자 {recentCount}명
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/event/homecoming/admin/guestbook"
              className="rounded-full border border-slate-200 px-5 py-2 text-sm text-slate-700 hover:border-blue/60 hover:text-blue"
            >
              방명록 관리로 이동
            </a>
            <button
              type="button"
              onClick={refreshAll}
              className="rounded-full border border-slate-200 px-5 py-2 text-sm text-slate-900 hover:border-slate-400 disabled:opacity-60"
              disabled={isLoading}
            >
              새로고침
            </button>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-[1.2fr,0.8fr]">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-lg shadow-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">추첨하기</h2>
              <span className="text-sm text-slate-500">1회 최대 50명</span>
            </div>
            <form className="flex flex-col gap-5" onSubmit={handleDraw}>
              <label className="text-sm text-slate-600">
                <span className="mb-2 block text-slate-800">추첨 인원 수</span>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={drawCount}
                  onChange={(event) => setDrawCount(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue focus:bg-white transition-all"
                />
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={isDrawing}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-[#60A5FA] to-[#A855F7] py-3 text-lg font-semibold text-white disabled:opacity-60"
                >
                  {isDrawing ? '추첨 중...' : '추첨하기'}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isResetting || sortedWinners.length === 0}
                  className="flex-1 rounded-2xl border border-rose-200 py-3 text-lg font-medium text-rose-500 hover:bg-rose-50 disabled:opacity-50"
                >
                  {isResetting ? '초기화 중...' : '당첨자 초기화'}
                </button>
              </div>
              <p className="text-sm text-green min-h-[20px]">{statusMessage}</p>
              {error && <p className="text-sm text-red">{error}</p>}
            </form>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-lg shadow-slate-100">
            <h2 className="text-xl font-semibold mb-4 text-slate-900">현재 상태</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500">총 참가자</p>
                <p className="text-2xl font-semibold text-slate-900">
                  {entriesCount.toLocaleString()}명
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">당첨자 수</p>
                <p className="text-2xl font-semibold text-slate-900">
                  {recentCount.toLocaleString()}명
                </p>
              </div>
              <div className="text-sm text-slate-500">
                추첨 후에는 자동으로 명단이 업데이트됩니다. 운영 중 중복 추첨을 피하려면
                새로고침으로 상태를 확인하세요.
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-lg shadow-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">당첨자 명단</h2>
              <p className="text-sm text-slate-500">당첨 시간 순으로 정렬됩니다.</p>
            </div>
            {!sortedWinners.length && !isLoading && (
              <span className="text-sm text-slate-400">아직 당첨자가 없습니다.</span>
            )}
          </div>
          {isLoading ? (
            <div className="py-10 text-center text-slate-400">불러오는 중...</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {sortedWinners.map((winner) => (
                <div
                  key={winner.id}
                  className={`rounded-2xl border px-5 py-4 transition-shadow ${
                    recentWinnerIds.includes(winner.id)
                      ? 'border-yellow shadow-[0_0_18px_rgba(251,188,5,0.35)]'
                      : 'border-slate-200'
                  }`}
                >
                  <p className="text-lg font-semibold text-slate-900">{winner.name}</p>
                  <p className="text-sm text-slate-500">{winner.wristbandSerial}</p>
                  <p className="text-xs text-slate-400 mt-2">{formatKoreanTime(winner.wonAt)}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
