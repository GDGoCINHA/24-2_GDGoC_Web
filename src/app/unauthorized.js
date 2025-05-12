// this is experimental page for nextjs
'use client';

import { useRouter } from "next/navigation";
import { Button } from "@nextui-org/react";
import Image from 'next/image';

// resource
import gdgocIcon from "@public/src/images/GDGoC_icon.png";

export default function Unauthorized() {
    const router = useRouter();

    const handleClick = () => {
        router.push("/auth/signin");
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

            {/* 401 에러 박스 */}
            <div className="z-10 bg-gray-800/70 backdrop-blur-sm p-4 sm:p-8 rounded-xl shadow-2xl border border-orange-500/20 max-w-[90%] sm:max-w-md w-full mx-4">
                <div className="flex flex-col items-center justify-center text-center">
                    {/* 401 아이콘 */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-orange-500/10 flex items-center justify-center mb-4 sm:mb-6" role="img" aria-label="401 icon">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>

                    {/* 401 내용 */}
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                        <span className="text-orange-500">401</span> Unauthorized
                    </h1>
                    <div className="w-12 sm:w-16 h-1 bg-gradient-to-r from-orange-500 to-orange-400 rounded-full mb-3 sm:mb-4" aria-hidden="true"></div>

                    <div className="bg-orange-500/10 py-3 px-6 rounded-lg border border-orange-500/20">
                        <p className="text-base sm:text-lg text-orange-100">로그인이 필요한 페이지입니다.</p>
                        <p className="text-base sm:text-lg text-orange-100">로그인 후 다시 시도해주세요.</p>
                    </div>

                    {/* 버튼 */}
                    <Button
                        onPress={handleClick}
                        className="mt-6 sm:mt-8 w-full max-w-[280px] h-10 sm:h-12 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-400 hover:to-orange-500 text-white text-base sm:text-lg font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-orange-500/30"
                        aria-label="로그인하기"
                    >
                        로그인하기
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