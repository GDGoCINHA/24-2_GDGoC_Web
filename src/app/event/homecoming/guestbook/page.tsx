'use client'

import { useGuestbookEntries } from '@/hooks/homecoming/useGuestbookEntries'
import GuestbookWordCloud from '@/components/event/homecoming/GuestbookWordCloud'

export default function GuestbookWordCloudPage() {
  const { entries, isLoading, error, lastSyncedAt } = useGuestbookEntries()

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E0F2FE] via-[#FDF2FF] to-[#FDE7F3] text-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background:
              'radial-gradient(circle at 30% 25%, rgba(96,165,250,0.35), transparent 45%), ' +
              'radial-gradient(circle at 70% 20%, rgba(249,168,212,0.3), transparent 40%), ' +
              'radial-gradient(circle at 50% 80%, rgba(134,239,172,0.3), transparent 45%)'
          }}
        />
      </div>

      <div className="absolute top-6 left-6 bg-white/80 backdrop-blur rounded-2xl px-6 py-4 shadow-lg text-slate-700">
        <p className="text-base font-semibold">현재 입장 {entries.length}명</p>
        {lastSyncedAt && (
          <p className="text-xs text-slate-500 mt-1">
            업데이트 {lastSyncedAt.toLocaleTimeString('ko-KR', { hour12: false })}
          </p>
        )}
        {error && <p className="text-xs text-red mt-1">{error}</p>}
      </div>

      <GuestbookWordCloud entries={entries} isLoading={isLoading} recentCount={5} />
    </div>
  )
}
