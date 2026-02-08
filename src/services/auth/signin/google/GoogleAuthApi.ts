'use client'
import axios from 'axios';

const GOOGLE_AUTH_URL = process.env.NEXT_PUBLIC_BASE_API_URL + '/auth/oauth2/google';

// Google 로그인 코드 교환 함수
export const exchangeGoogleToken = async (code) => {
  try {
    const response = await axios.get(`${GOOGLE_AUTH_URL}/callback?code=${code}`, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    });

    const cookies = response.headers['set-cookie'];
    if (!cookies) {
      console.warn('Google 로그인 응답에 쿠키가 없습니다.');
    }

    return response;
  } catch (error) {
    console.error('Google 토큰 교환 중 오류 발생:', error);
    throw error;
  }
};