'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';
import Loader from '@/components/ui/common/Loader';

/**
 * ApiCodeGuard
 * - /auth/{role}?next=<...> 를 호출해 200(또는 body.code=200)이면 통과
 * - 아니면 로그인(/auth/signin?next=...)으로 보냄
 *
 * props:
 *  - requiredRole: 'GUEST'|'MEMBER'|'CORE'|'LEAD'|'ORGANIZER'|'ADMIN' (백엔드 enum과 동일 문자열)
 *  - nextOverride?: string  // 지정 시 이 URL을 next로 사용, 없으면 현재 경로 기준 자동 계산
 *  - children: ReactNode
 */
export default function ApiCodeGuard({ requiredRole, nextOverride, children }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { apiClient } = useAuthenticatedApi();

    const [checking, setChecking] = useState(true);
    const [allowed, setAllowed] = useState(false);

    // next URL 계산 (override > 현재 경로)
    const nextUrl = useMemo(() => {
        if (nextOverride) return encodeURIComponent(nextOverride);
        const q = searchParams?.toString();
        return encodeURIComponent(`${pathname}${q ? `?${q}` : ''}`);
    }, [nextOverride, pathname, searchParams]);

    const cancelledRef = useRef(false);

    useEffect(() => {
        if (!requiredRole) {
            // 역할이 없으면 바로 차단
            router.replace(`/auth/signin?next=${nextUrl}`);
            return;
        }

        cancelledRef.current = false;

        const verify = async () => {
            try {
                // ✅ 권한 체크: /auth/{role}?next=...
                const res = await apiClient.get(`/auth/${requiredRole}`, {
                    params: { next: decodeURIComponent(nextUrl) }, // 서버가 raw URL 원하면 decode해서 전달
                });

                if (cancelledRef.current) return;

                const okHttp = res?.status === 200 || res?.status === 204;
                const okBody = (res?.data?.code ?? 200) === 200;

                if (okHttp && okBody) {
                    setAllowed(true);
                } else {
                    router.replace(`/auth/signin?next=${nextUrl}`);
                }
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

    if (checking) return <Loader isLoading />;
    if (!allowed) return null;
    return <>{children}</>;
}