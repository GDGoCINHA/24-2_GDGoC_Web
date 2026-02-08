'use client';
import axios from 'axios';

// 내부 프록시 제거하고, 백엔드 직접 호출
const LOGIN_URL = process.env.NEXT_PUBLIC_BASE_API_URL + '/auth/login';

export const login = async (email, password) => {
  try {
    const response = await axios.post(
      LOGIN_URL,
      { email, password },
      {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      }
    );
    return response;
  } catch (error) {
    console.warn('네트워크 오류 또는 서버에 연결할 수 없습니다.');
    alert('네트워크 오류 또는 서버에 연결할 수 없습니다.');
  }
};
