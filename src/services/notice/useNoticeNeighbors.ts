'use client'

import { useEffect, useRef, useState } from 'react'

import { noticeApi } from '@/services/notice/noticeApi'
import type { NoticeNeighbors } from '@/services/notice/noticeApi'

interface UseNoticeNeighborsResult {
  data: NoticeNeighbors | null
  loading: boolean
  error: Error | null
}

export const useNoticeNeighbors = (
  id: string | null | undefined
): UseNoticeNeighborsResult => {
  const [data, setData] = useState<NoticeNeighbors | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const cancelledRef = useRef(false)

  useEffect(() => {
    if (!id) {
      setData(null)
      setLoading(false)
      return
    }
    cancelledRef.current = false
    setLoading(true)
    setError(null)

    noticeApi
      .neighbors(id)
      .then((response) => {
        if (!cancelledRef.current) setData(response)
      })
      .catch((err) => {
        if (!cancelledRef.current) setError(err instanceof Error ? err : new Error(String(err)))
      })
      .finally(() => {
        if (!cancelledRef.current) setLoading(false)
      })

    return () => {
      cancelledRef.current = true
    }
  }, [id])

  return { data, loading, error }
}
