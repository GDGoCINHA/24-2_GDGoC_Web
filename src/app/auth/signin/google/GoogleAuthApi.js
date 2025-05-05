'use client'
import axios from 'axios';

const GOOGLE_AUTH_URL = 'https://gdgocinha.site/auth/oauth2/google';

// Google 로그인 코드 교환 함수
export const exchangeGoogleToken = async (code) => {
  try {
    const response = await axios.get(`${GOOGLE_AUTH_URL}/callback?code=${code}`, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true 
    });
    return response;
  } catch (error) {
    console.error('Google 토큰 교환 중 오류 발생:', error);
    throw error;
  }
};