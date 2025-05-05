'use client';
import axios from 'axios';

const CUSTOM_AUTH_URL = 'https://gdgocinha.site/auth';

export const login = async (email, password) => {
  try {
    const response = await axios.post(
      `${CUSTOM_AUTH_URL}/login`,
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
