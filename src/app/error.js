'use client';

import { useState, useEffect } from 'react';
import { Button } from "@nextui-org/react";
import Image from 'next/image';

// resource
import gdgocIcon from "@public/src/images/GDGoC_icon.png";

/**
 * @typedef {Object} ErrorProps
 * @property {Error} error - The error object
 * @property {() => void} reset - Function to reset the error state
 */
export default function Error({ error, reset }) {
    const [countdown, setCountdown] = useState(3);
    const errorCode = error?.statusCode || error?.status || 'Internal Server';
    const errorMessage = error?.message || 'Unknown Error has occurred';

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleClick = () => {
        reset();
        window.location.reload();
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
            {/* 물결 효과 배경 */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJ3YXZlIiB4PSIwIiB5PSIwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMjVjMjAgMCA0MCAxNSA1MCAxNXMzMC0xNSA1MC0xNSA0MCAxNSA1MCAxNSAzMC0xNSA1MC0xNXY1MGMtMjAgMC00MCAxNS01MCAxNXMtMzAtMTUtNTAtMTUtNDAgMTUtNTAgMTUtMzAtMTUtNTAtMTV6IiBmaWxsPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDMpIiAvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCN3YXZlKSIgLz48L3N2Zz4=')] opacity-30 animate-pulse" aria-hidden="true"></div>

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

            {/* 오류 박스 */}
            <div className="z-10 bg-gray-800/70 backdrop-blur-sm p-4 sm:p-8 rounded-xl shadow-2xl border border-gray-700 max-w-[90%] sm:max-w-md w-full mx-4">
                <div className="flex flex-col items-center justify-center text-center">
                    {/* 오류 아이콘 */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-4 sm:mb-6" role="img" aria-label="Error icon">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>

                    {/* 오류 내용 */}
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                        <span className="text-red-500">{errorCode}</span> Error
                    </h1>
                    <div className="w-12 sm:w-16 h-1 bg-red-500 rounded-full mb-3 sm:mb-4" aria-hidden="true"></div>

                    <p className="mt-2 text-base sm:text-lg text-gray-300">페이지 로드 중 에러가 발생하였습니다.</p>
                    <p className="text-base sm:text-lg text-gray-300 mb-4 sm:mb-6">Tech팀으로 연락 바랍니다!</p>

                    {/* 개발 환경에서만 표시 */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-2 p-3 sm:p-4 bg-gray-900 rounded-lg max-w-[90%] sm:max-w-md w-full overflow-auto">
                            <p className="text-yellow-400 text-xs sm:text-sm font-mono break-words">{errorMessage}</p>
                        </div>
                    )}

                    {/* 버튼 */}
                    <Button
                        onPress={handleClick}
                        className="mt-6 sm:mt-8 w-full max-w-[280px] h-10 sm:h-12 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white text-base sm:text-lg font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-red-500/30"
                        aria-label={`다시 시도하기 ${countdown > 0 ? `(${countdown}초)` : ''}`}
                    >
                        다시 시도하기 {countdown > 0 && `(${countdown}초)`}
                    </Button>

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
        </div>
    );
}