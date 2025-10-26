'use client';

import {useEffect, useMemo, useRef, useState} from 'react';
import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import {useAuthenticatedApi} from '@/hooks/useAuthenticatedApi';
import Loader from '@/components/ui/common/Loader';

/**
 * ApiCodeGuard
 * - /auth/{role}?team=<TEAM>&next=<...> (team은 전달 시에만 포함)
 * - 200(또는 body.code=200) 이면 통과, 아니면 /auth/signin?next=... 로 이동
 *
 * props:
 *  - requiredRole: 'GUEST'|'MEMBER'|'CORE'|'LEAD'|'ORGANIZER'|'ADMIN'  (필수)
 *  - requiredTeam?: 'HR'|'BD'|'TECH'|'PR_DESIGN' ... (선택, 전달 시에만 서버에 team 쿼리 포함)
 *  - nextOverride?: string (선택)
 */
export default function ApiCodeGuard({requiredRole, requiredTeam = '', nextOverride, children}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const {apiClient} = useAuthenticatedApi();

    const [checking, setChecking] = useState(true);
    const [allowed, setAllowed] = useState(false);

    // 사용자가 원래 가려던 경로 (로그인 실패 시 next로 넘김)
    const nextUrl = useMemo(() => {
        if (nextOverride) return encodeURIComponent(nextOverride);
        const q = searchParams?.toString();
        return encodeURIComponent(`${pathname}${q ? `?${q}` : ''}`);
    }, [nextOverride, pathname, searchParams]);

    const cancelledRef = useRef(false);

    useEffect(() => {
        if (!requiredRole) {
            router.replace(`/auth/signin?next=${nextUrl}`);
            return;
        }

        cancelledRef.current = false;

        const verify = async () => {
            try {
                // 쿼리 파라미터를 조건부로 구성
                const params = {next: decodeURIComponent(nextUrl)};
                if (requiredTeam) {
                    params.team = requiredTeam;
                }

                const res = await apiClient.get(`/auth/${requiredRole}`, {
                    params, headers: {
                        Accept: 'application/json',
                    }, // 401/403도 정상 분기로 처리
                    validateStatus: (s) => s === 200 || s === 204 || s === 401 || s === 403,
                });

                if (cancelledRef.current) return;

                const okHttp = res?.status === 200 || res?.status === 204;
                const okBody = (res?.data?.code ?? 200) === 200;

                if (okHttp && okBody) {
                    setAllowed(true);
                } else {
                    if (res?.status === 403) {
                        alert('권한이 부족합니다.');
                    }
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
    }, [apiClient, requiredRole, requiredTeam, nextUrl, router]);

    if (checking) return <Loader isLoading/>;
    if (!allowed) return null;
    return <>{children}</>;
}