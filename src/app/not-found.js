'use client';

import { useRouter } from "next/navigation";
import { Button } from "@nextui-org/react";
import Image from 'next/image';

// resource
import gdgocIcon from "@public/src/images/GDGoC_icon.png";

export default function NotFound() {
    const router = useRouter();

    const handleClick = () => {
        if (window.history.length > 1) {
            const referrer = document.referrer;
            const currentHost = window.location.host;

            if (referrer.includes(currentHost)) {
                router.back();
            } else {
                router.push("/");
            }
        } else {
            router.push("/");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
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

            {/* 404 에러 박스 */}
            <div className="z-10 bg-gray-800/70 backdrop-blur-sm p-4 sm:p-8 rounded-xl shadow-2xl border border-yellow-500/20 max-w-[90%] sm:max-w-md w-full mx-4">
                <div className="flex flex-col items-center justify-center text-center">
                    {/* 404 아이콘 */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4 sm:mb-6" role="img" aria-label="404 icon">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>

                    {/* 404 내용 */}
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                        <span className="text-yellow-500">404</span> Not Found
                    </h1>
                    <div className="w-12 sm:w-16 h-1 bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full mb-3 sm:mb-4" aria-hidden="true"></div>

                    <div className="bg-yellow-500/10 py-3 px-6 rounded-lg border border-yellow-500/20">
                        <p className="mt-2 text-base sm:text-lg text-yellow-100">찾으시려는 페이지가 없는거 같아요...</p>
                        <p className="text-base sm:text-lg text-yellow-100">이전 페이지로 돌아가시거나 홈으로 이동해주세요.</p>
                    </div>

                    {/* 버튼 */}
                    <Button
                        onPress={handleClick}
                        className="mt-6 sm:mt-8 w-full max-w-[280px] h-10 sm:h-12 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-500 text-white text-base sm:text-lg font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-yellow-500/30"
                        aria-label="돌아가기"
                    >
                        돌아가기
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