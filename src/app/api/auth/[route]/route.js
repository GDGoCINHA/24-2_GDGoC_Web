// 예시: /api/auth/[action]/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = 'https://gdgocinha.com/api/auth'; // 프록시 대상 주소

export async function POST(req, { params }) {
  const action = params.action; // 'refresh' or 'logout'
  const targetUrl = `${API_BASE_URL.replace(/\/$/, '')}/${action.replace(/^\//, '')}`;

  try {
    const cookies = req.headers.get('cookie') || '';
    const accessToken = req.headers.get('authorization');

    const response = await axios.post(
      targetUrl,
      await req.json(),
      {
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { Authorization: accessToken }),
          Cookie: cookies,
        },
        withCredentials: true,
      }
    );

    const nextResponse = NextResponse.json(response.data, {
      status: response.status,
    });

    const setCookies = response.headers['set-cookie'];
    if (setCookies) {
      setCookies.forEach((cookieStr) => {
        const [nameValue] = cookieStr.split(';');
        const [name, value] = nameValue.split('=');
        nextResponse.cookies.set(name, value, {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });
      });
    }

    return nextResponse;
  } catch (error) {
    console.error(`[AUTH PROXY ERROR] /${action}`, error.response?.data || error.message);
    return NextResponse.json(
      { error: 'AUTH PROXY ERROR' },
      { status: error.response?.status || 500 }
    );
  }
}
