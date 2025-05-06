'use client';
import axios from 'axios';

// 기존 직접 요청 URL
// const CUSTOM_AUTH_URL = 'https://gdgocinha.site/auth';

// 새로운 프록시 URL (상대 경로 사용)
const PROXY_AUTH_URL = '/api/signin';

export const login = async (email, password) => {
  try {
    const response = await axios.post(
      PROXY_AUTH_URL,
      { email, password },
      {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
        credentials: "include",
      }
    );
    return response;
  } catch (error) {
      console.warn('네트워크 오류 또는 서버에 연결할 수 없습니다.');
      alert('네트워크 오류 또는 서버에 연결할 수 없습니다.');
    }
};
