'use client';

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import {Button} from "@nextui-org/react";
import Image from 'next/image';

import gdgocIcon from "@public/src/images/GDGoC_icon.png";
import hambugi_gif from "./hambugi.gif";

export default function HambugiNotFound() {
    const router = useRouter();
    const urlParams = useSearchParams();
    const code = decodeURIComponent(urlParams.get('code')) || "null";
    const [isNotHambugi, setIsNotHambugi] = useState(true);

    useEffect(() => {
        const fetchCode = async () => {
            if (code && code === "햄부기햄북 햄북어 햄북스딱스 함부르크햄부가우가 햄비기햄부거 햄부가티햄부기온앤 온") {
                setIsNotHambugi(false);
            } else {
                setIsNotHambugi(true);
            }
        };

        fetchCode();
    }, [code]);

    const handleClick = () => {
        router.push("/study");
    };

    const handleHambugiClick = () => {
        alert("사실 그런건 없다... 공부나 열심히 하자");
        router.push("/study");
    };

    return (
        <>
            {isNotHambugi ? (
                <div className="flex flex-col items-center justify-center min-h-screen relative">
                    <div className="absolute inset-0 flex items-center justify-center opacity-35 pointer-events-none z-0">
                        <Image
                            src={gdgocIcon}
                            alt="GDGoC Icon"
                            width="500"
                            height="500"
                        />
                    </div>

                    <div className="z-10">
                        <div className="flex flex-col items-center justify-center">
                            <h1 className="text-3xl text-center font-bold text-white mobile:text-2xl">404 - Hambugi Not Found</h1>
                            <p className="mt-2 text-lg text-center text-white mobile:text-sm">찾으시려는 햄북딱스는 존재하지 않는거 같아요...</p>
                            <div className="mt-4 p-4 bg-[#1f1f1f] rounded-lg max-w-md mobile:w-3/4">
                                <p className="text-yellow-500 text-lg text-center font-mono break-words">[맛있는 햄북딱스 찾기]</p>
                                <p className="text-yellow-500 text-sm font-mono break-words">햄부기햄북 ___ 햄북스딱스 _________ _비기햄부_ 햄부가티햄부기온앤 _을 차려오거라. 햄___북 햄북어 _____ 함부르크햄부가우가 햄____거 _________ 온을 차려오라고 하지않앗느냐.</p>
                                <p className="text-blue-500 text-lg text-center font-mono break-words">[현재 입력된 햄북딱스]</p>
                                <p className="text-blue-500 text-sm text-center font-mono break-words">{`${code}`}</p>
                            </div>
                            <Button
                                onPress={handleClick}
                                className="mt-8 w-72 max-w-sm h-12 bg-red-500 text-white text-lg font-semibold rounded-lg"
                            >
                                스터디나 하러 돌아가기
                            </Button>
                        </div>
                    </div>
                </div>
            ):(
                <div className="flex flex-col items-center justify-center min-h-screen relative">
                    <div className="absolute inset-0 flex items-center justify-center opacity-35 pointer-events-none z-0">
                        <Image
                            src={hambugi_gif}
                            alt="Hambugi Icon"
                            width="500"
                            height="500"
                        />
                    </div>

                    <div className="z-10">
                        <div className="flex flex-col items-center justify-center">
                            <h1 className="text-3xl font-bold text-white">Hambugi Found</h1>
                            <p className="mt-2 text-lg text-white">당신은 성공적으로 비밀 햄부기를 발견하셨습니다!</p>
                            <div className="mt-4 p-4 bg-[#1f1f1f] rounded-lg max-w-md">
                                <p className="text-yellow-500 text-lg text-center font-mono break-words">ID: RUTHGYEULHAMBUGI</p>
                                <p className="text-yellow-500 text-lg text-center font-mono break-words">PWD: HAMBUGIMUKGOSHIPSO</p>
                            </div>
                            <Button
                                onPress={handleHambugiClick}
                                className="mt-8 w-72 max-w-sm h-12 bg-red-500 text-white text-lg font-semibold rounded-lg"
                            >
                                햄부기 먹으러 가기
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}