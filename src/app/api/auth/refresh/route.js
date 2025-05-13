import { NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_API_URL;

export async function POST(req) {
  const targetUrl = `${API_BASE_URL}/refresh`;
  const isProd = process.env.NODE_ENV === 'production';

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
          secure: isProd,
          sameSite: isProd ? 'none' : 'lax',
          domain: isProd ? '.gdgocinha.com' : undefined,
        });
      });
    }

    return nextResponse;
  } catch (error) {
    const status = error?.response?.status || 500;
    const message = (error && error.response && error.response.data) || error.message || 'Unknown error';
    console.error('[AUTH PROXY ERROR] /refresh', message);
    return NextResponse.json({ error: 'AUTH PROXY ERROR' }, { status });
  }
}
