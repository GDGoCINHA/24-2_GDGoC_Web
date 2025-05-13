import { NextResponse } from 'next/server';
import axios from 'axios';

const ORIGINAL_AUTH_URL = process.env.NEXT_PUBLIC_BASE_API_URL;

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const response = await axios.post(
      `${ORIGINAL_AUTH_URL}/auth/logout`,
      {},
      {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      }
    );

    // 응답 생성
    const nextResponse = NextResponse.json(
      { message: '로그아웃이 완료되었습니다.' },
      {
        status: response.status,
        statusText: response.statusText,
      }
    );

    // 쿠키 삭제
    const cookies = response.headers['set-cookie'];
    if (cookies) {
      cookies.forEach((cookie: string) => {
        const cookieParts = cookie.split(';')[0].split('=');
        const cookieName = cookieParts[0];

        // 쿠키 삭제
        nextResponse.cookies.delete(cookieName);
      });
    }

    nextResponse.cookies.delete('refresh_token');

    return nextResponse;
  } catch (error: any) {
    console.error('로그아웃 프록시 오류:', error);

    // 에러 응답 생성
    const errorResponse = NextResponse.json(
      { error: '로그아웃 처리 중 오류가 발생했습니다.' },
      { status: error.response?.status || 500 }
    );

    // 에러가 발생하더라도 클라이언트 측 쿠키는 삭제
    errorResponse.cookies.delete('refresh_token');

    return errorResponse;
  }
}
