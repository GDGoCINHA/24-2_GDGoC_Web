import axios from 'axios';
import { NextResponse } from 'next/server';

const ORIGINAL_AUTH_URL = 'https://gdgocinha.site/auth';

export async function POST(request) {
  try {
    // 클라이언트로부터 받은 요청 데이터 추출
    const { email, password } = await request.json();

    // gdgocinha.site/auth/login으로 요청 전달
    const response = await axios.post(
      `${ORIGINAL_AUTH_URL}/login`,
      { email, password },
      {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      }
    );

    // 원본 응답 데이터
    const data = response.data;

    // 쿠키 처리를 위한 응답 생성
    const nextResponse = NextResponse.json(data, {
      status: response.status,
      statusText: response.statusText,
    });

    // 원본 응답의 쿠키가 있으면 추출하여 현재 도메인에 설정
    const cookies = response.headers['set-cookie'];
    if (cookies) {
      cookies.forEach(cookie => {
        // 쿠키 문자열에서 이름과 값 부분만 추출
        const cookieParts = cookie.split(';')[0].split('=');
        const cookieName = cookieParts[0];
        const cookieValue = cookieParts.slice(1).join('=');
        
        // 추출한 쿠키를 현재 도메인에 설정
        nextResponse.cookies.set(cookieName, cookieValue, {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });
      });
    }

    return nextResponse;
  } catch (error) {
    console.error('로그인 프록시 오류:', error);
    return NextResponse.json(
      { error: '로그인 처리 중 오류가 발생했습니다.' },
      { status: error.response?.status || 500 }
    );
  }
}
