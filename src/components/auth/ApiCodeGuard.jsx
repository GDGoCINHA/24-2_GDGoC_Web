'use client';

import {useEffect, useMemo, useRef, useState} from 'react';
import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import {useAuthenticatedApi} from '@/hooks/useAuthenticatedApi';
import Loader from '@/components/ui/common/Loader';

export default function ApiCodeGuard({requiredRole, nextOverride, children}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const {apiClient} = useAuthenticatedApi();

    const [checking, setChecking] = useState(true);
    const [allowed, setAllowed] = useState(false);

    // 로그인 실패 시 넘길 원래 목적지
    const nextUrl = useMemo(() => {
        if (nextOverride) return encodeURIComponent(nextOverride);
        const q = searchParams?.toString();
        return encodeURIComponent(`${pathname}${q ? `?${q}` : ''}`);
    }, [nextOverride, pathname, searchParams]);

    const cancelledRef = useRef(false);
    const alertedRef = useRef(false); // 403 alert 중복 방지

    useEffect(() => {
        if (!requiredRole) {
            router.replace(`/auth/signin?next=${nextUrl}`);
            return;
        }

        cancelledRef.current = false;

        const verify = async () => {
            try {
                const res = await apiClient.get(`/auth/${requiredRole}`, {
                    headers: {
                        Accept: 'application/json', 'X-Auth-Probe': '1',
                    }, validateStatus: (s) => s === 200 || s === 204 || s === 401 || s === 403,
                });

                if (cancelledRef.current) return;

                // 성공(권한 충족)
                if (res.status === 200 || res.status === 204 || (res?.data?.code ?? 200) === 200) {
                    setAllowed(true);
                    return;
                }

                // 인증 필요
                if (res.status === 401) {
                    router.replace(`/auth/signin?next=${nextUrl}`);
                    return;
                }

                // 권한 부족
                if (res.status === 403) {
                    if (!alertedRef.current) {
                        alertedRef.current = true;
                        // eslint-disable-next-line no-alert
                        alert('권한이 부족합니다.');
                    }
                    // 안전한 경로로 이동 (필요 시 원하는 경로로 변경)
                    router.replace('/');
                    return;
                }

                // 기타는 로그인으로 유도
                router.replace(`/auth/signin?next=${nextUrl}`);
            } catch {
                if (!cancelledRef.current) {
                    router.replace(`/auth/signin?next=${nextUrl}`);
                }
            } finally {
                if (!cancelledRef.current) setChecking(false);
            }
        };

        void verify();
        return () => {
            cancelledRef.current = true;
        };
    }, [apiClient, requiredRole, nextUrl, router]);

    if (checking) return <Loader isLoading/>;
    if (!allowed) return null;
    return <>{children}</>;
}