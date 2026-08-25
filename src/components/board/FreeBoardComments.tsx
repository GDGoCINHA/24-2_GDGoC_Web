'use client'

import type { AxiosInstance } from 'axios'
import { useCallback, useEffect, useState } from 'react'

import { useAuth } from '@/hooks/useAuth'
import {
  createFreeComment,
  deleteFreeComment,
  fetchFreeComments,
  updateFreeComment
} from '@/services/board/freeClient'
import type { FreeBoardComment } from '@/types/free'
import { hasAtLeast } from '@/utils/auth/role'
import { formatDate } from '@/utils/formatDate'

/**
 * 디자인 시스템의 `GdgTextarea`·`GdgButton` 은 밝은 배경을 전제로 만들어졌다.
 * dusk 배경 위에서는 흰 입력칸이 그대로 떠 버려 여기서는 쓰지 않는다.
 */
const TEXTAREA_CLASS =
  'w-full resize-y rounded-xl border border-[rgba(240,234,228,0.14)] bg-[rgba(240,234,228,0.05)] px-4 py-3.5 text-[15px] leading-[1.7] text-dusk-ink-100 outline-none transition-colors placeholder:text-dusk-ink-800 focus:border-[rgba(240,234,228,0.32)]'

const SUBMIT_CLASS =
  'self-end whitespace-nowrap rounded-full bg-ember px-[26px] py-3 text-sm font-medium text-ember-ink transition-colors hover:bg-dusk-ink-100 hover:text-dusk-base disabled:opacity-50'

const CANCEL_CLASS =
  'whitespace-nowrap rounded-full border border-[rgba(240,234,228,0.20)] px-4 py-2 text-[13px] text-dusk-ink-400 transition-colors hover:border-[rgba(240,234,228,0.5)] hover:text-dusk-ink-100'

export interface FreeBoardCommentsProps {
  postId: number
  apiClient: AxiosInstance
}

/** 답글까지 합한 수. 제목의 "댓글 N" 은 화면에 보이는 항목 수와 같아야 한다. */
const countAll = (comments: FreeBoardComment[]): number =>
  comments.reduce((sum, comment) => sum + 1 + comment.replies.length, 0)

/**
 * 자유게시판 댓글.
 *
 * 대댓글은 1단계까지다. 대댓글에도 '답글'을 띄우지만 서버가 같은 최상위 댓글에 붙이므로
 * 깊이는 더 늘지 않는다. 화면에서 들여쓰기가 두 단계를 넘지 않는 이유다.
 */
export function FreeBoardComments({ postId, apiClient }: FreeBoardCommentsProps) {
  const { user } = useAuth()

  const [comments, setComments] = useState<FreeBoardComment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [input, setInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  // 답글을 달 대상. null 이면 최상위 댓글을 쓰는 중이다.
  const [replyTo, setReplyTo] = useState<number | null>(null)
  const [replyInput, setReplyInput] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editInput, setEditInput] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  const canWrite = hasAtLeast(user?.userRole, 'MEMBER')

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)

    fetchFreeComments(postId, apiClient)
      .then((result) => {
        if (alive) setComments(result)
      })
      .catch(() => {
        if (alive) setError('댓글을 불러오지 못했습니다.')
      })
      .finally(() => {
        if (alive) setLoading(false)
      })

    return () => {
      alive = false
    }
  }, [apiClient, postId, reloadKey])

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  const submit = useCallback(
    async (content: string, parentId?: number) => {
      if (!content.trim()) return
      setSubmitting(true)
      try {
        await createFreeComment(apiClient, postId, { content: content.trim(), parentId })
        setInput('')
        setReplyInput('')
        setReplyTo(null)
        reload()
      } catch {
        alert('댓글 작성에 실패했습니다.')
      } finally {
        setSubmitting(false)
      }
    },
    [apiClient, postId, reload]
  )

  const submitEdit = useCallback(
    async (commentId: number) => {
      if (!editInput.trim()) return
      setSubmitting(true)
      try {
        await updateFreeComment(apiClient, commentId, editInput.trim())
        setEditingId(null)
        setEditInput('')
        reload()
      } catch {
        alert('댓글 수정에 실패했습니다.')
      } finally {
        setSubmitting(false)
      }
    },
    [apiClient, editInput, reload]
  )

  const remove = useCallback(
    async (commentId: number) => {
      if (!window.confirm('댓글을 삭제하시겠습니까?')) return
      try {
        await deleteFreeComment(apiClient, commentId)
        reload()
      } catch {
        alert('댓글 삭제에 실패했습니다.')
      }
    },
    [apiClient, reload]
  )

  /** 서버 규칙(FreeBoardCommentService.requireAuthorOrOrganizer)과 같은 조건이다. */
  const canManage = (comment: FreeBoardComment): boolean => {
    if (comment.deleted) return false
    if (hasAtLeast(user?.userRole, 'ORGANIZER')) return true
    return user?.id !== undefined && user.id === comment.authorId
  }

  const renderComment = (comment: FreeBoardComment, isReply: boolean) => (
    <li key={comment.id} className={isReply ? '' : 'border-t border-t-[rgba(240,234,228,0.08)]'}>
      <div className={`flex flex-col gap-[7px] ${isReply ? 'py-4' : 'py-[18px]'}`}>
        {comment.deleted ? (
          <p className="text-[15px] text-dusk-ink-800">삭제된 댓글입니다.</p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3 text-[13px] text-dusk-ink-800">
              <span className="text-dusk-ink-100">{comment.authorName}</span>
              <span>{formatDate(comment.createdAt)}</span>
            </div>

            {editingId === comment.id ? (
              <div className="flex flex-col gap-2 pt-1">
                <textarea
                  rows={3}
                  value={editInput}
                  onChange={(event) => setEditInput(event.target.value)}
                  className={TEXTAREA_CLASS}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => submitEdit(comment.id)}
                    disabled={submitting}
                    className={SUBMIT_CLASS}
                  >
                    저장
                  </button>
                  <button type="button" onClick={() => setEditingId(null)} className={CANCEL_CLASS}>
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <p className="whitespace-pre-wrap break-keep text-[15px] leading-[1.75] text-dusk-ink-200">
                {comment.content}
              </p>
            )}
          </>
        )}

        {editingId !== comment.id && (
          <div className="flex flex-wrap gap-[14px] text-[13px] text-dusk-ink-800">
            {canWrite && !comment.deleted && (
              <button
                type="button"
                onClick={() => {
                  setReplyTo(replyTo === comment.id ? null : comment.id)
                  setReplyInput('')
                }}
                className="transition-colors hover:text-dusk-ink-100"
              >
                답글
              </button>
            )}
            {canManage(comment) && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(comment.id)
                    setEditInput(comment.content ?? '')
                  }}
                  className="transition-colors hover:text-dusk-ink-100"
                >
                  수정
                </button>
                <button
                  type="button"
                  onClick={() => remove(comment.id)}
                  className="transition-colors hover:text-signal-err"
                >
                  삭제
                </button>
              </>
            )}
          </div>
        )}

        {replyTo === comment.id && (
          <div className="flex flex-col gap-2 pt-2">
            <textarea
              rows={2}
              value={replyInput}
              placeholder="답글을 남겨보세요"
              onChange={(event) => setReplyInput(event.target.value)}
              className={TEXTAREA_CLASS}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => submit(replyInput, comment.id)}
                disabled={submitting}
                className={SUBMIT_CLASS}
              >
                답글 등록
              </button>
              <button type="button" onClick={() => setReplyTo(null)} className={CANCEL_CLASS}>
                취소
              </button>
            </div>
          </div>
        )}
      </div>

      {comment.replies.length > 0 && (
        <ul className="ml-[18px] flex flex-col border-l border-l-[rgba(240,234,228,0.12)] pl-[18px]">
          {comment.replies.map((reply) => renderComment(reply, true))}
        </ul>
      )}
    </li>
  )

  return (
    <section className="border-t border-t-[rgba(240,234,228,0.10)] pt-7">
      <h2 className="text-[17px] font-semibold tracking-[-0.02em]">
        댓글 {loading || error ? '' : countAll(comments)}
      </h2>

      {error && <p className="mt-5 text-[15px] text-signal-err">{error}</p>}
      {loading && <p className="mt-5 text-[15px] text-dusk-ink-800">불러오는 중...</p>}

      {!loading && !error && comments.length === 0 && (
        <p className="mt-5 text-[15px] text-dusk-ink-800">첫 댓글을 남겨보세요.</p>
      )}

      {!loading && !error && comments.length > 0 && (
        <ul className="mt-[22px] flex flex-col">
          {comments.map((comment) => renderComment(comment, false))}
        </ul>
      )}

      {canWrite && (
        <div className="mt-[26px] flex flex-col gap-3 border-t border-t-[rgba(240,234,228,0.08)] pt-6">
          <textarea
            rows={3}
            value={input}
            placeholder="댓글을 남겨보세요"
            onChange={(event) => setInput(event.target.value)}
            className={TEXTAREA_CLASS}
          />
          <button
            type="button"
            onClick={() => submit(input)}
            disabled={submitting}
            className={SUBMIT_CLASS}
          >
            댓글 등록
          </button>
        </div>
      )}
    </section>
  )
}
