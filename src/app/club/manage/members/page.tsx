'use client'

import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { clubBackTarget, isFromManage } from '@/components/club/clubNav'
import { ClubBackLink } from '@/components/club/ClubUi'
import { ClubSiteHeader } from '@/components/club/ClubSiteHeader'
import {
  DUSK_CHECKBOX,
  DUSK_CHIP_ACTIVE,
  DUSK_GHOST_BUTTON,
  DUSK_INPUT,
  DUSK_SUBMIT_BUTTON
} from '@/components/ui/dusk/DuskForm'
import { formatMajorLabel } from '@/constant/majorOptions'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import {
  addClubMembers,
  fetchClubDetail,
  fetchClubMembers,
  readClubError,
  searchClubMemberCandidates
} from '@/services/club/clubClient'
import type { ClubDetail, ClubMember, ClubMemberAddResult, ClubMemberCandidate } from '@/types/club'
import { cn } from '@/utils/cn'

const describeResult = ({ added, approved, skipped }: ClubMemberAddResult): string =>
  [
    `${added + approved}명을 멤버로 넣었어요.`,
    approved > 0 ? `신청 중이던 ${approved}명은 승인했어요.` : null,
    skipped > 0 ? `이미 멤버인 ${skipped}명은 건너뛰었어요.` : null
  ]
    .filter(Boolean)
    .join(' ')

/**
 * 멤버 일괄 추가. 카톡으로 인원을 먼저 모은 뒤 리더·운영진이 한 번에 넣는다.
 * 넣으면 수락 단계 없이 바로 멤버다. 모집 마감·승인 전이어도 넣는다. 리더·운영진이 아니면 서버가 403.
 */
export default function ClubMemberAddPage() {
  const searchParams = useSearchParams()
  const clubId = Number(searchParams.get('id') ?? 0)
  const back = clubBackTarget(clubId, isFromManage(searchParams))
  const { apiClient } = useAuthenticatedApi()
  const [club, setClub] = useState<ClubDetail | null>(null)
  const [members, setMembers] = useState<ClubMember[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [searched, setSearched] = useState('')
  const [hits, setHits] = useState<ClubMemberCandidate[] | null>(null)
  // 검색어를 바꿔도 고른 사람은 남는다 — 여러 이름을 차례로 찾아 한 번에 넣는다.
  const [picked, setPicked] = useState<ClubMemberCandidate[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const load = useCallback(() => {
    if (!clubId) return
    Promise.all([fetchClubDetail(apiClient, clubId), fetchClubMembers(apiClient, clubId)])
      .then(([detail, active]) => {
        setClub(detail)
        setMembers(active)
        setLoadError(null)
      })
      .catch((err) => setLoadError(readClubError(err, '소모임을 불러오지 못했어요.')))
  }, [apiClient, clubId])

  useEffect(load, [load])

  const search = async (q: string) => {
    if (!q) return
    setBusy(true)
    setError(null)
    try {
      setHits(await searchClubMemberCandidates(apiClient, clubId, q))
      setSearched(q)
    } catch (err) {
      setError(readClubError(err))
    } finally {
      setBusy(false)
    }
  }

  const isPicked = (userId: number) => picked.some((p) => p.userId === userId)
  const toggle = (candidate: ClubMemberCandidate) =>
    setPicked((prev) =>
      prev.some((p) => p.userId === candidate.userId)
        ? prev.filter((p) => p.userId !== candidate.userId)
        : [...prev, candidate]
    )

  const submit = async () => {
    if (picked.length === 0) return
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      const result = await addClubMembers(
        apiClient,
        clubId,
        picked.map((p) => p.userId)
      )
      setNotice(describeResult(result))
      setPicked([])
      load()
      // 방금 넣은 사람이 「이미 멤버」로 보이게 검색 결과를 다시 받는다.
      if (searched) setHits(await searchClubMemberCandidates(apiClient, clubId, searched))
    } catch (err) {
      setError(readClubError(err))
    } finally {
      setBusy(false)
    }
  }

  if (loadError || !club) {
    return (
      <main className="min-h-screen">
        <ClubSiteHeader />
        <p className="py-24 text-center text-[15px] text-dusk-ink-800">
          {loadError ?? '불러오는 중…'}
        </p>
      </main>
    )
  }

  // 정원은 막지 않는다. 넘는다는 사실만 알린다. 고른 사람이 없으면 「넣으면 넘는다」 는 말이 안 맞아 띄우지 않는다.
  const overCapacity =
    picked.length > 0 && club.capacity != null && members.length + picked.length > club.capacity

  return (
    <main className="min-h-screen">
      <ClubSiteHeader />
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-8 px-[clamp(20px,5vw,44px)] pb-[100px] pt-11 mobile:pt-6">
        <div>
          <ClubBackLink href={back.href} label={back.label} />
          <h1 className="mt-6 text-[clamp(25px,3vw,36px)] font-semibold leading-[1.3] tracking-[-0.03em]">
            멤버 추가
          </h1>
          <p className="mt-2.5 text-sm leading-[1.7] text-dusk-ink-700">
            이름으로 찾아 고른 뒤 한 번에 넣어요. 넣으면 수락 없이 바로 {club.name} 멤버가 돼요.
            {club.status === 'PENDING' && ' 승인 전이어도 미리 넣어 둘 수 있어요.'}
          </p>
        </div>

        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            void search(query.trim())
          }}
        >
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="이름으로 찾기"
            aria-label="이름으로 찾기"
            className={DUSK_INPUT}
          />
          <button
            type="submit"
            disabled={busy || !query.trim()}
            className={cn(DUSK_GHOST_BUTTON, 'shrink-0')}
          >
            찾기
          </button>
        </form>

        {hits && hits.length === 0 && (
          <p className="text-sm leading-[1.7] text-dusk-ink-800">
            ‘{searched}’ 이름의 부원이 없어요. 홈페이지에 가입하지 않았거나 아직 부원으로 등록되지
            않았을 수 있어요.
          </p>
        )}
        {hits && hits.length > 0 && (
          <ul className="-mt-4 overflow-hidden rounded-[14px] border border-dusk-line">
            {hits.map((hit) => {
              const already = hit.memberStatus === 'ACTIVE'
              const meta = [hit.studentId, hit.major ? formatMajorLabel(hit.major) : null]
                .filter(Boolean)
                .join(' · ')
              return (
                <li key={hit.userId} className="border-b border-dusk-line-soft last:border-b-0">
                  <label
                    className={cn(
                      'flex items-center gap-3 px-[18px] py-3',
                      already ? 'cursor-default opacity-60' : 'cursor-pointer'
                    )}
                  >
                    <input
                      type="checkbox"
                      disabled={already}
                      checked={already || isPicked(hit.userId)}
                      onChange={() => toggle(hit)}
                      className={DUSK_CHECKBOX}
                    />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="text-[15px]">{hit.name}</span>
                      {meta && <span className="text-[13px] text-dusk-ink-800">{meta}</span>}
                    </span>
                    {already && (
                      <span className="shrink-0 text-xs text-dusk-ink-800">이미 멤버</span>
                    )}
                    {hit.memberStatus === 'PENDING' && (
                      <span className="shrink-0 text-xs text-tag-event">신청 중 · 넣으면 승인</span>
                    )}
                  </label>
                </li>
              )
            })}
          </ul>
        )}

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">
            고른 사람 <span className="text-ember">{picked.length}</span>
          </h2>
          {picked.length === 0 ? (
            <p className="text-sm text-dusk-ink-800">
              찾아서 체크하면 여기에 모여요. 여러 번 찾아 한꺼번에 넣을 수 있어요.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {picked.map((p) => (
                <button
                  key={p.userId}
                  type="button"
                  onClick={() => toggle(p)}
                  aria-label={`${p.name} 빼기`}
                  className={cn(DUSK_CHIP_ACTIVE, 'px-4 py-2 text-sm')}
                >
                  {p.name} ✕
                </button>
              ))}
            </div>
          )}
          {overCapacity && (
            <div className="rounded-[10px] border border-[rgba(224,162,78,0.4)] bg-[rgba(224,162,78,0.08)] px-3.5 py-2.5 text-[13px] text-tag-event">
              모두 넣으면 정원 {club.capacity}명을 넘어요. 추가는 그대로 돼요.
            </div>
          )}
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">지금 멤버 {members.length}명</h2>
          <p className="text-sm leading-[1.7] text-dusk-ink-400">
            {members.map((m) => m.name).join(', ')}
          </p>
        </section>

        {/* 결과 안내는 버튼 바로 위에 둔다 — 멤버가 많으면 본문 끝이 화면 밖이라 넣었는지 모른다. */}
        <div className="sticky bottom-0 flex flex-col gap-2.5 bg-gradient-to-t from-[#2C2028] from-70% to-transparent pb-[calc(12px+env(safe-area-inset-bottom))] pt-7">
          {error && <p className="text-sm text-signal-err">{error}</p>}
          {notice && <p className="text-sm text-signal-ok">{notice}</p>}
          <button
            type="button"
            disabled={busy || picked.length === 0}
            onClick={submit}
            className={DUSK_SUBMIT_BUTTON}
          >
            {picked.length > 0 ? `${picked.length}명 멤버로 넣기` : '넣을 사람을 골라 주세요'}
          </button>
        </div>
      </div>
    </main>
  )
}
