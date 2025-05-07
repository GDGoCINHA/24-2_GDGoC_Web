import { NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = 'https://gdgocinha.site/auth'; // 프록시 대상 주소

export async function POST(req) {
  const targetUrl = `${API_BASE_URL}/refresh`;

  try {
    const cookies = req.headers.get('cookie') || '';

    const response = await axios.post(
      targetUrl,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
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
    console.error('[AUTH PROXY ERROR] /refresh', error.response?.data || error.message);
    return NextResponse.json({ error: 'AUTH PROXY ERROR' }, { status: error.response?.status || 500 });
  }
}
