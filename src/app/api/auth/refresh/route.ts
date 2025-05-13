import { NextRequest, NextResponse } from 'next/server';
import axios, { AxiosError, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_API_URL;
const TIMEOUT = 5000;

interface RefreshResponse {
  accessToken?: string;
  refreshToken?: string;
  message?: string;
}

interface ErrorResponse {
  error: string;
}

export async function POST(req: NextRequest): Promise<NextResponse<RefreshResponse | ErrorResponse>> {
  const refreshUrl = `${API_BASE_URL}/auth/refresh`;
  const isProd = process.env.NODE_ENV === 'production';

  try {
    const cookies = req.headers.get('cookie') || '';
    const body = await req.json();

    const response: AxiosResponse<RefreshResponse> = await axios.post(
      refreshUrl,
      body,
      {
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookies,
        },
        withCredentials: true,
        timeout: TIMEOUT,
      }
    );

    const nextResponse = NextResponse.json(response.data, {
      status: response.status,
    });

    const setCookies = response.headers['set-cookie'];
    if (setCookies) {
      setCookies.forEach((cookieStr: string) => {
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
    const axiosError = error as AxiosError<ErrorResponse>;
    const status = axiosError?.response?.status || 500;
    let errorMessage = 'Authentication failed';
    
    if (axiosError.code === 'ECONNABORTED') {
      errorMessage = 'Request timeout';
    } else if (axiosError.response?.data?.error) {
      errorMessage = axiosError.response.data.error;
    }
    
    console.error('[AUTH PROXY ERROR] /refresh', axiosError.message);
    return NextResponse.json({ error: errorMessage }, { status });
  }
} 