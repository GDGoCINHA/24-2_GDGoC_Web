import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_API_URL;

// 보호된 경로 목록
const protectedPaths = [
  '/admin',
  '/main',
  '/study'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 보호된 경로인지 확인
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  if (!isProtectedPath) {
    return NextResponse.next();
  }

  // 쿠키에서 리프레시 토큰 확인
  const refreshToken = request.cookies.get('refresh_token');

  // 리프레시 토큰이 없는 경우 로그인 페이지로 리디렉션
  if (!refreshToken) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  // 리프레시 토큰이 있으면 요청을 계속 진행
  return NextResponse.next();
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
};