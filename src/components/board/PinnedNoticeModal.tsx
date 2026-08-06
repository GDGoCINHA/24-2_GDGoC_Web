'use client'

import axios, { type AxiosInstance } from 'axios'
import { Reorder } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'

import { NoticeCategoryTag } from '@/components/board/NoticeCategoryTag'
import { GdgButton, GdgSearchField } from '@/components/ui/design-system'
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="상단 고정 관리"
    >
      <div className="flex max-h-[85vh] w-full max-w-[640px] flex-col gap-4 overflow-y-auto rounded-2xl border border-gray-800 bg-black p-6 text-white">
        <div className="flex items-center justify-between">
          <h2 className="typo-pc-s2">상단 고정 관리</h2>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-white">
            닫기
          </button>
        </div>

        <section className="flex flex-col gap-2">
          <p className="text-gray-500 typo-pc-c1">
            현재 고정 {selected.length}/{MAX_PINNED} — 드래그해 순서를 바꿉니다.
          </p>
          {loading ? (
            <p className="py-6 text-center text-gray-500 typo-pc-b3">불러오는 중...</p>
          ) : selected.length === 0 ? (
            <p className="py-6 text-center text-gray-500 typo-pc-b3">고정된 공지가 없습니다.</p>
          ) : (
            <Reorder.Group
              axis="y"
              values={selected}
              onReorder={setSelected}
              className="flex flex-col gap-2"
            >
              {selected.map((notice, index) => (
                <Reorder.Item key={notice.id} value={notice}>
                  <div className="flex cursor-grab items-center gap-3 rounded-lg bg-gray-100 px-4 py-2 typo-pc-b3">
                    <span className="shrink-0 text-gray-700">{index + 1}</span>
                    <NoticeCategoryTag category={notice.category} />
                    <span className="flex-1 truncate">{notice.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemove(notice.id)}
                      className="shrink-0 underline"
                    >
                      빼기
                    </button>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          )}
        </section>

        <section className="flex flex-col gap-2 border-t border-gray-800 pt-4">
          <p className="text-gray-500 typo-pc-c1">
            고정할 공지 찾기 (공개된 공지만 고정할 수 있습니다)
          </p>
          <GdgSearchField
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                setSubmittedKeyword(keyword)
              }
            }}
            placeholder="제목·내용으로 검색"
          />
          <ul className="flex flex-col gap-1">
            {candidates.map((notice) => {
              const alreadySelected = selected.some((item) => item.id === notice.id)
              return (
                <li
                  key={notice.id}
                  className="flex items-center gap-3 border-b border-gray-800 px-1 py-2 typo-pc-b3"
                >
                  <NoticeCategoryTag category={notice.category} />
                  <span className="flex-1 truncate">{notice.title}</span>
                  <button
                    type="button"
                    onClick={() => handleAdd(notice)}
                    disabled={alreadySelected || isFull}
                    className="shrink-0 underline disabled:opacity-30"
                  >
                    {alreadySelected ? '고정됨' : '추가'}
                  </button>
                </li>
              )
            })}
            {candidates.length === 0 && (
              <li className="py-4 text-center text-gray-500 typo-pc-c1">검색 결과가 없습니다.</li>
            )}
          </ul>
          {isFull && (
            <p className="text-gray-500 typo-pc-c1">
              슬롯이 가득 찼습니다. 추가하려면 먼저 하나를 빼세요.
            </p>
          )}
        </section>

        {errorMessage && <p className="text-red typo-pc-b3">{errorMessage}</p>}

        <div className="flex gap-3">
          <GdgButton variant="bordered" fullWidth onClick={onClose}>
            취소
          </GdgButton>
          <GdgButton variant="active" fullWidth onClick={handleSave} loading={saving}>
            저장
          </GdgButton>
        </div>
      </div>
    </div>
  )
}
