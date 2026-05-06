'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { noticeApi } from '@/services/notice/noticeApi'
import type { Notice } from '@/services/notice/noticeApi'

interface UseNoticeDetailResult {
  data: Notice | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export const useNoticeDetail = (id: string | null | undefined): UseNoticeDetailResult => {
  const [data, setData] = useState<Notice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const cancelledRef = useRef(false)

  const fetchDetail = useCallback(async () => {
    if (!id) {
      setData(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const notice = await noticeApi.detail(id)
      if (!cancelledRef.current) setData(notice)
    } catch (err) {
      if (!cancelledRef.current) setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      if (!cancelledRef.current) setLoading(false)
    }
  }, [id])

  useEffect(() => {
    cancelledRef.current = false
    void fetchDetail()
    return () => {
      cancelledRef.current = true
    }
  }, [fetchDetail])

  return { data, loading, error, refetch: fetchDetail }
}
