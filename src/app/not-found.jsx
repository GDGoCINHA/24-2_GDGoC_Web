'use client';

import React from 'react';
import {Button} from "@nextui-org/react";
import {useRouter} from "next/navigation";
import Image from 'next/image';
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
                    <h1 className="text-3xl font-bold text-white">404 - Page Not Found</h1>
                    <p className="mt-2 text-lg text-white">찾으시려는 페이지가 없는거 같아요...</p>
                    <Button
                        onPress={handleClick}
                        className="mt-8 w-72 max-w-sm h-12 bg-red-500 text-white text-lg font-semibold rounded-lg"
                    >
                        돌아가기
                    </Button>
                </div>
            </div>
        </div>
    );
}