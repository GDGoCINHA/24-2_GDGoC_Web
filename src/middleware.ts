import { NextRequest, NextResponse } from 'next/server'

// 보호된 경로 목록
const protectedPaths = [
  '/admin',
  '/main',
  '/study'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 보호된 경로인지 확인
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
  if (!isProtectedPath) {
    return NextResponse.next()
  }

  // Authorization 헤더에서 엑세스 토큰 확인 -> 현재로서는 작동 안함
  const authHeader = request.headers.get('authorization')
  const accessToken = authHeader?.split(' ')[1] // Bearer 토큰
  
  // 쿠키에서 리프레시 토큰 확인
  const refreshToken = request.cookies.get('refresh_token')

  // 엑세스 토큰이 없는 경우
  if (!accessToken) {
    // 리프레시 토큰이 있는 경우 토큰 재발급 API 호출
    if (refreshToken) {
      try {
        const response = await fetch(`${request.nextUrl.origin}/api/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken: refreshToken.value }),
          credentials: 'include',
        })

        if (response.ok) {
          // 토큰 재발급 성공 시 원래 요청 계속 진행
          return NextResponse.next()
        }
      } catch (error) {
        console.error('Token refresh failed:', error)
      }
    }
    // 리프레시 토큰이 없거나 토큰 재발급 실패 시 로그인 페이지로 리디렉션
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  // 모든 조건을 통과하면 다음 미들웨어로 진행
  return NextResponse.next()
}

// 미들웨어가 실행될 경로 설정
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public assets)
     * - auth (인증 관련 페이지)
     * - robots.txt, sitemap.xml (SEO 관련 파일)
     * - error, loading, not-found (Next.js 시스템 페이지)
     * - recruit (모집 관련 페이지)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public|auth|robots.txt|sitemap.xml|error|loading|not-found|unauthorized|forbidden|recruit).*)',
  ],
}