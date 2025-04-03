'use client';

import React from 'react';
import {Button} from "@nextui-org/react";
import {useRouter} from "next/navigation";
import Image from 'next/image';
import gdgocIcon from "@public/src/images/GDGoC_icon.png";

export default function Error({error, reset}) {
    const router = useRouter();
    const errorCode = error?.statusCode || error?.status || 'Internal Server';
    const errorMessage = error?.message || 'Unknown Error has occurred';

    const handleClick = () => {
        reset();
        window.location.reload();
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-35 pointer-events-none z-0">
                <Image
                    src={gdgocIcon}
                    alt="GDGoC Icon"
                    width={500}
                    height={500}
                />
            </div>

            <div className="z-10">
                <div className="flex flex-col items-center justify-center">
                    <h1 className="text-3xl font-bold text-white">{errorCode} Error</h1>
                    <p className="mt-2 text-lg text-white">페이지 로드 중 에러가 발생하였습니다.</p>
                    <p className="text-lg text-white">개발팀으로 연락 바랍니다!</p>
                    {/* only at development env */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-4 p-4 bg-[#1f1f1f] rounded-lg max-w-md">
                            <p className="text-yellow-500 text-sm font-mono break-words">{errorMessage}</p>
                        </div>
                    )}
                    <Button
                        onPress={handleClick}
                        className="mt-8 w-72 max-w-sm h-12 bg-red-500 text-white text-lg font-semibold rounded-lg"
                    >
                        다시 시도하기
                    </Button>
                </div>
            </div>
        </div>
    );
}