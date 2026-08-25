'use client'

import axios, { type AxiosInstance } from 'axios'
import { Reorder } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'

import { DUSK_CANCEL_BUTTON, DUSK_INPUT, DUSK_SUBMIT_BUTTON } from '@/components/ui/dusk/DuskForm'
import { NoticeCategoryTag } from '@/components/board/NoticeCategoryTag'
import {
  fetchNoticeList,
  fetchPinnedNotices,
  replacePinnedNotices
} from '@/services/board/noticeClient'
import type { NoticeSummary } from '@/types/notice'

/** pinned_notice.display_order의 CHECK (1~3)과 같은 값이다. */
const MAX_PINNED = 3

export interface PinnedNoticeModalProps {
  open: boolean
  apiClient: AxiosInstance
  onClose: () => void
  onSaved: () => void
}

/**
 * 상단 고정 관리.
 *
 * 개별 pin/unpin/reorder 엔드포인트가 없다 — display_order가 UNIQUE이고 CHECK(1~3)이라
 * 1↔2 교체에 중간 값을 둘 자리가 없기 때문이다(백엔드 설계 §7.2). 그래서 드래그·추가·빼기
 * 중에는 아무 요청도 보내지 않고, "저장"에서 최종 상태 하나를 PUT으로 통째로 보낸다.
 */
export function PinnedNoticeModal({ open, apiClient, onClose, onSaved }: PinnedNoticeModalProps) {
  const [selected, setSelected] = useState<NoticeSummary[]>([])
  const [keyword, setKeyword] = useState('')
  const [submittedKeyword, setSubmittedKeyword] = useState('')
  const [candidates, setCandidates] = useState<NoticeSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // 열 때마다 서버에서 현재 고정 상태를 다시 읽는다. 다른 ORGANIZER가 그 사이 바꿨을 수 있다.
  useEffect(() => {
    if (!open) return

    let alive = true
    setLoading(true)
    setErrorMessage(null)
    setKeyword('')
    setSubmittedKeyword('')

    fetchPinnedNotices(apiClient)
      .then((pinned) => {
        if (alive) setSelected(pinned)
      })
      .catch(() => {
        if (alive) setErrorMessage('현재 고정 목록을 불러오지 못했습니다.')
      })
      .finally(() => {
        if (alive) setLoading(false)
      })

    return () => {
      alive = false
    }
  }, [apiClient, open])

  // 후보 목록. 미공개 글은 서버가 고정을 거부하므로(PINNED_NOT_ELIGIBLE) 애초에 빼고 보여준다.
  useEffect(() => {
    if (!open) return

    let alive = true
    fetchNoticeList({ page: 0, size: 10, keyword: submittedKeyword }, apiClient)
      .then(({ items }) => {
        if (alive) setCandidates(items.filter((item) => item.isPublished))
      })
      .catch(() => {
        if (alive) setCandidates([])
      })

    return () => {
      alive = false
    }
  }, [apiClient, open, submittedKeyword])

  const handleAdd = useCallback((notice: NoticeSummary) => {
    setErrorMessage(null)
    setSelected((prev) => {
      if (prev.length >= MAX_PINNED) return prev
      if (prev.some((item) => item.id === notice.id)) return prev
      return [...prev, notice]
    })
  }, [])

  const handleRemove = useCallback((id: number) => {
    setSelected((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const handleSave = useCallback(async () => {
    setSaving(true)
    setErrorMessage(null)
    try {
      await replacePinnedNotices(
        apiClient,
        selected.map((item) => item.id)
      )
      onSaved()
      onClose()
    } catch (err) {
      // 서버 메시지를 그대로 보여준다 — NoticeErrorCode가 이미 사용자용 문구다
      // ("상단 고정은 최대 3개까지 가능합니다." / "고정할 수 없는 공지가 포함되어 있습니다.").
      if (axios.isAxiosError(err) && typeof err.response?.data?.message === 'string') {
        setErrorMessage(err.response.data.message)
      } else {
        setErrorMessage('고정 공지 저장에 실패했습니다.')
      }
    } finally {
      setSaving(false)
    }
  }, [apiClient, onClose, onSaved, selected])

  if (!open) return null

  const isFull = selected.length >= MAX_PINNED

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(12,9,15,0.72)] px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="상단 고정 관리"
    >
      {/* 카드 전체를 스크롤시키면 후보 10개에 밀려 아래쪽 "저장"이 화면 밖으로 나간다.
          그러면 위쪽 "닫기"만 보여서 저장하지 않고 닫게 된다. 가운데만 스크롤한다. */}
      <div className="flex max-h-[85vh] w-full max-w-[640px] flex-col gap-4 overflow-hidden rounded-2xl border border-dusk-line bg-dusk-raise p-6 text-dusk-ink-100">
        <div className="flex shrink-0 items-center justify-between">
          <h2 className="text-[19px] font-semibold tracking-[-0.02em]">상단 고정 관리</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-dusk-ink-800 transition-colors hover:text-dusk-ink-100"
          >
            닫기
          </button>
        </div>

        {/* min-h-0 이 없으면 flex 아이템의 min-height:auto 때문에 줄어들지 않아 스크롤이 안 생긴다. */}
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
          <section className="flex flex-col gap-2.5">
            <p className="text-[13px] text-dusk-ink-700">
              현재 고정 {selected.length}/{MAX_PINNED} — 드래그해 순서를 바꿉니다.
            </p>
            {loading ? (
              <p className="py-6 text-center text-sm text-dusk-ink-800">불러오는 중...</p>
            ) : selected.length === 0 ? (
              <p className="py-6 text-center text-sm text-dusk-ink-800">고정된 공지가 없습니다.</p>
            ) : (
              <Reorder.Group
                axis="y"
                values={selected}
                onReorder={setSelected}
                className="flex flex-col gap-2"
              >
                {selected.map((notice, index) => (
                  <Reorder.Item key={notice.id} value={notice}>
                    <div className="flex cursor-grab items-center gap-3 rounded-[10px] bg-[rgba(240,234,228,0.06)] px-4 py-[9px] text-[15px] active:cursor-grabbing">
                      <span className="shrink-0 text-sm text-ember">{index + 1}</span>
                      <NoticeCategoryTag category={notice.category} />
                      <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                        {notice.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemove(notice.id)}
                        className="shrink-0 text-sm text-dusk-ink-800 transition-colors hover:text-signal-err"
                      >
                        빼기
                      </button>
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            )}
          </section>

          <section className="flex flex-col gap-2.5 border-t border-t-[rgba(240,234,228,0.10)] pt-4">
            <p className="text-[13px] text-dusk-ink-700">
              고정할 공지 찾기 (공개된 공지만 고정할 수 있습니다)
            </p>
            <input
              type="text"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  setSubmittedKeyword(keyword)
                }
              }}
              placeholder="제목·내용으로 검색"
              className={DUSK_INPUT}
            />
            <ul className="flex flex-col">
              {candidates.map((notice) => {
                const alreadySelected = selected.some((item) => item.id === notice.id)
                return (
                  <li
                    key={notice.id}
                    className="flex items-center gap-3 border-b border-b-[rgba(240,234,228,0.08)] px-1 py-2.5 text-[15px]"
                  >
                    <NoticeCategoryTag category={notice.category} />
                    <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                      {notice.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAdd(notice)}
                      disabled={alreadySelected || isFull}
                      className="shrink-0 text-sm text-dusk-ink-400 underline transition-colors hover:text-ember disabled:opacity-30 disabled:hover:text-dusk-ink-400"
                    >
                      {alreadySelected ? '고정됨' : '추가'}
                    </button>
                  </li>
                )
              })}
              {candidates.length === 0 && (
                <li className="py-4 text-center text-[13px] text-dusk-ink-800">
                  검색 결과가 없습니다.
                </li>
              )}
            </ul>
            {isFull && (
              <p className="text-[13px] text-dusk-ink-800">
                슬롯이 가득 찼습니다. 추가하려면 먼저 하나를 빼세요.
              </p>
            )}
          </section>
        </div>

        {/* 저장 실패 문구는 스크롤 밖에 둔다 — 안에 있으면 스크롤 위치에 따라 안 보인다. */}
        {errorMessage && <p className="shrink-0 text-sm text-signal-err">{errorMessage}</p>}

        <div className="flex shrink-0 gap-2.5">
          <button type="button" onClick={onClose} className={`flex-1 ${DUSK_CANCEL_BUTTON}`}>
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={DUSK_SUBMIT_BUTTON}
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  )
}
