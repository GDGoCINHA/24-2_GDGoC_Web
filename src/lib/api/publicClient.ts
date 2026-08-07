'use client'

import axios from 'axios'

/**
 * 인증 토큰을 붙이지 않고 401/403 인터셉터도 없는 공개 조회 전용 클라이언트.
 * useAuthenticatedApi의 apiClient로 공개 목록/상세를 부르면 비로그인 방문자가
 * 401 인터셉터에 의해 /login으로 튕겨나간다 — 그래서 별도로 둔다.
 */
export const publicClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_API_URL,
  headers: { 'Content-Type': 'application/json' }
})
