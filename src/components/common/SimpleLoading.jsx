'use client';

import { useState } from 'react';
import Image from 'next/image';

// resource
import gdgocIcon from "@public/src/images/GDGoC_icon.png";

export default function SimpleLoading() {
    const [imageError, setImageError] = useState(false);

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center" role="status" aria-label="컴포넌트 로딩 중">
            {/* 로딩 아이콘 */}
            <div className="relative mb-8">
                <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping"></div>
                <div className="relative">
                    {!imageError ? (
                        <Image
                            src={gdgocIcon}
                            alt="GDGoC Icon"
                            width={56}
                            height={56}
                            className="animate-pulse"
                            priority
                            loading="eager"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="w-14 h-14 bg-blue-500/10 rounded-full flex items-center justify-center">
                            <span className="text-blue-500 text-sm">GDGoC</span>
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

            {/* 로딩 프로그레스 바 */}
            <div className="w-full max-w-[150px] h-1 bg-blue-500/20 rounded-full overflow-hidden">
                <div className="h-full w-1/3 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full loading-progress-shuttle"></div>
            </div>

            {/* CSS for animations */}
            <style jsx global>{`
                @keyframes loading-progress-shuttle {
                    0% { transform: translateX(-100%); }
                    50% { transform: translateX(300%); }
                    100% { transform: translateX(-100%); }
                }

                .loading-progress-shuttle {
                    display: block;
                    animation: loading-progress-shuttle 1.5s ease-in-out infinite;
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