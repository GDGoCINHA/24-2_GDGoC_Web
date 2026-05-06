'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { noticeApi } from '@/services/notice/noticeApi'
import type { NoticeListParams, NoticeListResponse } from '@/services/notice/noticeApi'

interface UseNoticeListResult {
  data: NoticeListResponse | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export const useNoticeList = (params: NoticeListParams): UseNoticeListResult => {
  const [data, setData] = useState<NoticeListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const cancelledRef = useRef(false)

  const paramsKey = JSON.stringify(params)

  const fetchList = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await noticeApi.list(JSON.parse(paramsKey))
      if (!cancelledRef.current) setData(response)
    } catch (err) {
      if (!cancelledRef.current) setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      if (!cancelledRef.current) setLoading(false)
    }
  }, [paramsKey])

  useEffect(() => {
    cancelledRef.current = false
    void fetchList()
    return () => {
      cancelledRef.current = true
    }
  }, [fetchList])

  return { data, loading, error, refetch: fetchList }
}
