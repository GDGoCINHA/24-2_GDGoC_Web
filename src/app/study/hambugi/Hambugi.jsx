import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import hambugi_png from './hambugi.png';
import hambugi_gif from "./hambugi.gif";
//import hambugi_bgm from "./hambugi.mp3";

export default function Hambugi() {
    const router = useRouter();
    const [visible, setVisible] = useState(true);
    const [buttonOn, setButtonOn] = useState(false);
    const audioRef = useRef(null);

    const animation = () => {
        if (window.TypeHangul) {
            window.TypeHangul.type("#hambugiTitle", {
                text: "햄부기햄북 이벤트 발생!",
                speed: 8,
                intervalType: 80,
                humanize: 0.02
            });

            setTimeout(() => {
                setButtonOn(true);
            }, 3000);
        }
    };

    useEffect(() => {
        /*
        audioRef.current = new Audio(hambugi_bgm);
        audioRef.current.loop = true;
        audioRef.current.play().catch(e => console.warn("Audio play error:"));
        */

        if (typeof window !== "undefined" && window.TypeHangul) {
            animation();
        } else {
            setTimeout(() => {
                if (typeof window !== "undefined" && window.TypeHangul) {
                    animation();
                }
            }, 1000);
        }

        /*
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
         */
    }, []);

    const handleClose = () => {
        setVisible(false);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
    };

    return visible && (
        <div className="fixed top-0 left-0 w-screen h-screen z-[9999] flex items-center justify-center backdrop-blur-md bg-black/50">
            <div className="w-7/12 border border-white rounded-lg p-8 relative overflow-hidden bg-black/80 mobile:w-3/4 mobile:h-4/12">
                {buttonOn && (
                    <button
                        onClick={handleClose}
                        className="absolute m-auto top-5 right-5 text-white text-2xl font-bold hover:text-red-600 bg-transparent"
                    >
                        ×
                    </button>
                )}
                <div className="text-white relative z-10">
                    <h1 id="hambugiTitle" className="text-white text-2xl text-center mobile:text-xl">경고!</h1>
                    <hr className="mt-5 mb-5" />
                    <Image
                        src={hambugi_gif}
                        alt="hambugi"
                        width="200"
                        height="200"
                        className="w-6/12 mx-auto mt-4 mobile:w-3/4 mobile:h-3/4" />
                </div>

                {/* 누가 발견할지 모르겠는데 몰래 심어두는 코드ㅎㅎ */}
                <p className="text-center text-sm text-black mobile:hidden"><a className="text-white">{"->"}</a>해당 페이지 코드 내 숨겨진 문구가 존재할지도...<a className="text-white">{"<-"}</a></p>
                <p id="숨겨진 정보" className="hidden text-center text-sm text-white">HiDdEn uRl:{" "}
                    <a
                        onClick={() => router.push('/study/hambugi?code=')}
                        className="underline cursor-pointer">
                        ~.com/study/hambugi?code=
                    </a>
                </p>
            </div>
        </div>
    );
}