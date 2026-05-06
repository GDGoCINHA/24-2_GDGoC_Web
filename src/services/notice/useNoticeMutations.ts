'use client'

import { useCallback, useState } from 'react'

import { noticeApi } from '@/services/notice/noticeApi'
import type {
  Notice,
  NoticeAuthor,
  NoticeCreateInput,
  NoticeUpdateInput
} from '@/services/notice/noticeApi'

interface UseNoticeMutationsResult {
  create: (input: NoticeCreateInput, authorOverride?: NoticeAuthor) => Promise<Notice>
  update: (id: string, input: NoticeUpdateInput) => Promise<Notice>
  remove: (id: string) => Promise<{ id: string }>
  pending: boolean
  error: Error | null
}

export const useNoticeMutations = (): UseNoticeMutationsResult => {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const wrap = useCallback(async <T,>(fn: () => Promise<T>): Promise<T> => {
    setPending(true)
    setError(null)
    try {
      return await fn()
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err))
      setError(e)
      throw e
    } finally {
      setPending(false)
    }
  }, [])

  const create = useCallback(
    (input: NoticeCreateInput, authorOverride?: NoticeAuthor) =>
      wrap(() => noticeApi.create(input, authorOverride)),
    [wrap]
  )

  const update = useCallback(
    (id: string, input: NoticeUpdateInput) => wrap(() => noticeApi.update(id, input)),
    [wrap]
  )

  const remove = useCallback((id: string) => wrap(() => noticeApi.remove(id)), [wrap])

  return { create, update, remove, pending, error }
}
