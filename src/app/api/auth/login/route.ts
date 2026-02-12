import { NextResponse } from 'next/server'
import axios from 'axios'

import { rateLimit } from '@/lib/rate-limit'

const ORIGINAL_AUTH_URL = process.env.NEXT_PUBLIC_BASE_API_URL

interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
  error?: string
  [key: string]: any
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    // Rate limiting 적용
    const limiter = rateLimit({
      interval: 60 * 1000, // 1분
      uniqueTokenPerInterval: 500
    })

    try {
      await limiter.check(5, 'LOGIN_ATTEMPT') // 1분당 5회 시도 제한
    } catch {
      return NextResponse.json(
        { error: '너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.' },
        { status: 429 }
      )
    }

    // 클라이언트로부터 받은 요청 데이터 추출
    const { email, password }: LoginRequest = await request.json()

    // 입력값 검증
    if (!email || !password) {
      return NextResponse.json({ error: '이메일과 비밀번호를 모두 입력해주세요.' }, { status: 400 })
    }

    if (!email.includes('@') || !email.includes('.')) {
      return NextResponse.json({ error: '유효한 이메일 주소를 입력해주세요.' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: '비밀번호는 8자 이상이어야 합니다.' }, { status: 400 })
    }

    const isProd = process.env.NODE_ENV === 'production'

    // 기존 refresh_token 쿠키 삭제
    const response = NextResponse.json({})
    response.cookies.set('refresh_token', '', {
      path: '/',
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      domain: isProd ? '.gdgocinha.com' : undefined,
      expires: new Date(0)
    })

    const authResponse = await axios.post(
      `${ORIGINAL_AUTH_URL}/auth/login`,
      { email, password },
      {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      }
    )

    const data = authResponse.data

    const nextResponse = NextResponse.json(data, {
      status: authResponse.status,
      statusText: authResponse.statusText
    })

    // 원본 응답의 쿠키가 있으면 추출하여 현재 도메인에 설정
    const cookies = authResponse.headers['set-cookie']
    if (cookies) {
      cookies.forEach((cookie: string) => {
        const cookieParts = cookie.split(';')[0].split('=')
        const cookieName = cookieParts[0]
        const cookieValue = cookieParts.slice(1).join('=')

        nextResponse.cookies.set(cookieName, cookieValue, {
          path: '/',
          httpOnly: true,
          secure: isProd,
          sameSite: isProd ? 'none' : 'lax',
          domain: isProd ? '.gdgocinha.com' : undefined
        })
      })
    }

    return nextResponse
  } catch (error: any) {
    console.error('로그인 프록시 오류:', error)

    // 구체적인 에러 메시지 처리
    if (error.response) {
      switch (error.response.status) {
        case 401:
          return NextResponse.json(
            { error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
            { status: 401 }
          )
        case 403:
          return NextResponse.json({ error: '접근이 거부되었습니다.' }, { status: 403 })
        case 404:
          return NextResponse.json({ error: '서비스를 찾을 수 없습니다.' }, { status: 404 })
        default:
          return NextResponse.json(
            { error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
            { status: error.response.status }
          )
      }
    }

    return NextResponse.json(
      { error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    )
  }
}
