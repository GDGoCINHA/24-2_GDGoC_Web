'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

// resource
import gdgocIcon from "@public/src/images/GDGoC_icon.png";

const LOADING_TEXTS = [
    '페이지를 불러오는 중',
    '데이터를 준비하는 중',
    '잠시만 기다려주세요',
    '거의 다 왔습니다'
];

export default function Loading() {
    const [loadingDots, setLoadingDots] = useState('.');
    const [loadingText, setLoadingText] = useState(LOADING_TEXTS[0]);
    const [imageError, setImageError] = useState(false);

    // 로딩 점(...)의 애니메이션
    useEffect(() => {
        const dotsInterval = setInterval(() => {
            setLoadingDots(dots => dots.length >= 3 ? '.' : dots + '.');
        }, 500);

        return () => clearInterval(dotsInterval);
    }, []);

    // 로딩 텍스트를 주기적으로 변경
    useEffect(() => {
        const textInterval = setInterval(() => {
            setLoadingText(current => {
                const currentIndex = LOADING_TEXTS.indexOf(current);
                const nextIndex = (currentIndex + 1) % LOADING_TEXTS.length;
                return LOADING_TEXTS[nextIndex];
            });
        }, 3000);

        return () => clearInterval(textInterval);
    }, []);

    return (
        <div 
            className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black relative overflow-hidden"
            role="status"
            aria-label="페이지 로딩 중"
        >
            {/* 물결 효과 배경 */}
            <div className="absolute w-screen h-screen top-0 left-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJ3YXZlIiB4PSIwIiB5PSIwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMjVjMjAgMCA0MCAxNSA1MCAxNXMzMC0xNSA1MC0xNSA0MCAxNSA1MCAxNSAzMC0xNSA1MC0xNXY1MGMtMjAgMC00MCAxNS01MCAxNXMtMzAtMTUtNTAtMTUtNDAgMTUtNTAgMTUtMzAtMTUtNTAtMTV6IiBmaWxsPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDMpIiAvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCN3YXZlKSIgLz48L3N2Zz4=')] opacity-30 animate-pulse"></div>

            <div className="z-10 flex flex-col items-center justify-center">
                {/* 로딩 아이콘 애니메이션 */}
                <div className="relative mb-8">
                    <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping"></div>
                    <div className="relative">
                        {!imageError ? (
                            <Image
                                src={gdgocIcon}
                                alt="GDGoC Icon"
                                width={120}
                                height={120}
                                className="animate-pulse"
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <div className="w-[120px] h-[120px] bg-gray-700 rounded-full flex items-center justify-center">
                                <span className="text-white text-2xl">GDGoC</span>
                            </div>
                        )}
                    </div>

                    {/* 회전하는 로딩 원 */}
                    <div className="absolute inset-0 w-full h-full">
                        <svg className="absolute inset-0 w-full h-full animate-spin-slow" viewBox="0 0 100 100">
                            <circle
                                cx="50"
                                cy="50"
                                r="48"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeDasharray="1, 8"
                                className="text-blue-500/60"
                            />
                        </svg>
                    </div>
                </div>

                {/* 로딩 텍스트 */}
                <div 
                    className="bg-gray-800/70 backdrop-blur-sm py-4 px-8 rounded-xl shadow-lg border border-gray-700 max-w-md"
                    aria-live="polite"
                >
                    <h2 className="text-2xl font-medium text-white text-center">
                        {loadingText}<span className="inline-block min-w-8">{loadingDots}</span>
                    </h2>
                </div>

                {/* 로딩 프로그레스 바 */}
                <div className="mt-8 w-64 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full loading-progress"></div>
                </div>
            </div>

            {/* CSS for animations */}
            <style jsx global>{`
                html, body {
                    overflow: hidden;
                }

                @media (min-width: 768px) {
                    html, body {
                    overflow: auto;
                    }
                }

                @keyframes loading-progress {
                    0% { transform: scaleX(0); }
                    25% { transform: scaleX(0.35); }
                    50% { transform: scaleX(0.6); }
                    75% { transform: scaleX(0.85); }
                    100% { transform: scaleX(1); }
                }

                .loading-progress {
                    display: block;
                    width: 100%;
                    transform-origin: left;
                    animation: loading-progress 2s ease-in-out infinite;
                }

                .animate-spin-slow {
                    animation: spin 3s linear infinite;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}