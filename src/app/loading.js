'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

// resource
import gdgocIcon from "@public/src/images/GDGoC_icon.png";

const LOADING_TEXTS = [
    '페이지를 불러오는 중',
    '데이터를 가져오는 중',
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
            {/* 아이콘 배경 */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none z-0" aria-hidden="true">
                <div className="relative">
                    <Image
                        src={gdgocIcon}
                        alt="GDGoC Icon"
                        width={600}
                        height={600}
                        className="animate-pulse"
                        priority
                    />
                </div>
            </div>

            {/* 로딩 박스 */}
            <div className="z-10 bg-gray-800/70 backdrop-blur-sm p-4 sm:p-8 rounded-xl shadow-2xl border border-blue-500/20 max-w-[90%] sm:max-w-md w-full mx-4">
                <div className="flex flex-col items-center justify-center text-center">
                    {/* 로딩 아이콘 */}
                    <div className="relative mb-4 sm:mb-6">
                        <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping"></div>
                        <div className="relative">
                            {!imageError ? (
                                <Image
                                    src={gdgocIcon}
                                    alt="GDGoC Icon"
                                    width={80}
                                    height={80}
                                    className="animate-pulse"
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <div className="w-[80px] h-[80px] bg-blue-500/10 rounded-full flex items-center justify-center">
                                    <span className="text-blue-500 text-xl">GDGoC</span>
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
                                    className="text-blue-500"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* 로딩 텍스트 */}
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                        <span className="text-blue-500">Loading</span>
                    </h2>
                    <div className="w-12 sm:w-16 h-1 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full mb-3 sm:mb-4" aria-hidden="true"></div>

                    <div className="bg-blue-500/10 py-3 px-6 rounded-lg border border-blue-500/20">
                        <p className="text-lg sm:text-xl text-blue-100">
                            {loadingText}<span className="inline-block min-w-8 text-blue-400">{loadingDots}</span>
                        </p>
                    </div>

                    {/* 로딩 프로그레스 바 */}
                    <div className="mt-6 sm:mt-8 w-full max-w-[280px] h-1.5 bg-blue-500/20 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full loading-progress"></div>
                    </div>

                    {/* 작은 로고 */}
                    <div className="mt-4 sm:mt-6">
                        <Image
                            src={gdgocIcon}
                            alt="GDGoC Small Icon"
                            width={32}
                            height={32}
                            className="opacity-50"
                        />
                    </div>
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