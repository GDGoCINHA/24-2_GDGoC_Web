'use client'

import type { AxiosInstance } from 'axios'
import { useCallback, useEffect, useState } from 'react'

import { GdgButton, GdgTextarea } from '@/components/ui/design-system'
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

export interface FreeBoardCommentsProps {
  postId: number
  apiClient: AxiosInstance
}

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
    <li key={comment.id} className={isReply ? 'border-l border-gray-200 pl-4' : ''}>
      <div className="flex flex-col gap-1 py-3">
        {comment.deleted ? (
          <p className="text-gray-600 typo-pc-b3 mobile:typo-m-b3">삭제된 댓글입니다.</p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3 text-gray-500 typo-pc-c1 mobile:typo-m-c1">
              <span className="text-white">{comment.authorName}</span>
              <span>{formatDate(comment.createdAt)}</span>
            </div>

            {editingId === comment.id ? (
              <div className="flex flex-col gap-2 pt-1">
                <GdgTextarea
                  fullWidth
                  rows={3}
                  value={editInput}
                  onChange={(event) => setEditInput(event.target.value)}
                />
                <div className="flex gap-2">
                  <GdgButton
                    variant="active"
                    onClick={() => submitEdit(comment.id)}
                    loading={submitting}
                  >
                    저장
                  </GdgButton>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="rounded-full border border-gray-800 px-4 py-1 typo-pc-c1 mobile:typo-m-c1"
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <p className="whitespace-pre-wrap typo-pc-b3 mobile:typo-m-b3">{comment.content}</p>
            )}
          </>
        )}

        {editingId !== comment.id && (
          <div className="flex flex-wrap gap-3 pt-1 text-gray-600 typo-pc-c1 mobile:typo-m-c1">
            {canWrite && !comment.deleted && (
              <button
                type="button"
                onClick={() => {
                  setReplyTo(replyTo === comment.id ? null : comment.id)
                  setReplyInput('')
                }}
                className="hover:text-white"
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
                  className="hover:text-white"
                >
                  수정
                </button>
                <button
                  type="button"
                  onClick={() => remove(comment.id)}
                  className="hover:text-red"
                >
                  삭제
                </button>
              </>
            )}
          </div>
        )}

        {replyTo === comment.id && (
          <div className="flex flex-col gap-2 pt-2">
            <GdgTextarea
              fullWidth
              rows={2}
              value={replyInput}
              onChange={(event) => setReplyInput(event.target.value)}
            />
            <div className="flex gap-2">
              <GdgButton
                variant="active"
                onClick={() => submit(replyInput, comment.id)}
                loading={submitting}
              >
                답글 등록
              </GdgButton>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="rounded-full border border-gray-800 px-4 py-1 typo-pc-c1 mobile:typo-m-c1"
              >
                취소
              </button>
            </div>
          </div>
        )}
      </div>

      {comment.replies.length > 0 && (
        <ul className="ml-4 flex flex-col">
          {comment.replies.map((reply) => renderComment(reply, true))}
        </ul>
      )}
    </li>
  )

  return (
    <section className="flex flex-col gap-4 border-t border-gray-800 pt-6">
      <h2 className="typo-pc-s2 mobile:typo-m-s3">댓글</h2>

      {error && <p className="text-red typo-pc-b3 mobile:typo-m-b3">{error}</p>}
      {loading && <p className="text-gray-500 typo-pc-b3 mobile:typo-m-b3">불러오는 중...</p>}

      {!loading && !error && comments.length === 0 && (
        <p className="text-gray-500 typo-pc-b3 mobile:typo-m-b3">첫 댓글을 남겨보세요.</p>
      )}

      {!loading && !error && comments.length > 0 && (
        <ul className="flex flex-col divide-y divide-gray-100">
          {comments.map((comment) => renderComment(comment, false))}
        </ul>
      )}

      {canWrite && (
        <div className="flex flex-col gap-2 pt-2">
          <GdgTextarea
            fullWidth
            rows={3}
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
          <GdgButton variant="active" onClick={() => submit(input)} loading={submitting}>
            댓글 등록
          </GdgButton>
        </div>
      )}
    </section>
  )
}
