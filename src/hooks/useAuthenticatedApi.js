import {useCallback, useEffect, useMemo, useRef} from 'react';
import {useRouter} from 'next/navigation';
import axios from 'axios';

import {useAuth} from './useAuth';
import {useAuthApi} from './useAuthApi';


export const useAuthenticatedApi = () => {
    const {accessToken, setAccessToken, clearAuth} = useAuth();
    const {refreshAccessToken, logout} = useAuthApi();
    const router = useRouter();
    const refreshPromiseRef = useRef(null);
    const accessTokenRef = useRef(accessToken);

    useEffect(() => {
        accessTokenRef.current = accessToken;
    }, [accessToken]);

    useEffect(() => {
        return () => {
            refreshPromiseRef.current = null;
        };
    }, []);

    const reAccessToken = useCallback(async () => {
        if (!refreshPromiseRef.current) {
            refreshPromiseRef.current = refreshAccessToken();
        }

        try {
            const res = await refreshPromiseRef.current;
            return res;
        } catch (error) {
            throw error;
        } finally {
            refreshPromiseRef.current = null;
        }
    }, [refreshAccessToken]);

    //로그인 이후 api 요청
    const apiClient = useMemo(() => {
        const client = axios.create({
            baseURL: process.env.NEXT_PUBLIC_BASE_API_URL, withCredentials: true,
        });

        // 요청 인터셉터
        client.interceptors.request.use((config) => {
            if (!config.headers['Content-Type']) {
                config.headers['Content-Type'] = 'application/json';
            }

            if (accessTokenRef.current) {
                config.headers.Authorization = `Bearer ${accessTokenRef.current}`;
            }
            return config;
        }, (error) => Promise.reject(error));

        // 응답 인터셉터
        client.interceptors.response.use((response) => response, async (error) => {
            const originalRequest = error.config;
            const status = error.response?.status;

            // next 후보 수집: 헤더 > sessionStorage > 현재 URL (유지)
            const pickNext = () => originalRequest?.headers?.['X-Next-Url'] || (typeof window !== 'undefined' && sessionStorage.getItem('NEXT_URL_OVERRIDE')) || (typeof window !== 'undefined' && window.location.href) || '/';

            if (status === 403) {
                try {
                    alert('권한이 부족합니다.');
                } catch {
                }
                router.replace('/main');
                return Promise.reject(error);
            }

            // 401이고 아직 재시도 안 했으면: 재발급 → 원요청 재시도
            if (status === 401 && !originalRequest?._retry) {
                originalRequest._retry = true;
                try {
                    const res = await reAccessToken();
                    const newAccessToken = res.data.data.access_token;

                    setAccessToken(newAccessToken);
                    accessTokenRef.current = newAccessToken;

                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return client(originalRequest);
                } catch (refreshError) {
                    // 재발급 실패 → 로그인으로
                    const next = pickNext();
                    try {
                        alert('로그인이 만료되었습니다. 재로그인 해주세요.');
                    } catch {
                    }
                    clearAuth();
                    router.replace(`/auth/signin?next=${encodeURIComponent(next)}`);
                    return Promise.reject(refreshError);
                }
            }

            return Promise.reject(error);
        });


        return client;
    }, [setAccessToken, clearAuth, router, reAccessToken]);

    //로그아웃 핸들
    const handleLogout = useCallback(async () => {
        try {
            await logout();
        } catch (error) {
            console.error('로그아웃 handle 실패:', error);
        } finally {
            clearAuth();
            router.push('/auth/signin');
        }
    }, [logout, router, clearAuth]);

    return {apiClient, handleLogout};
};