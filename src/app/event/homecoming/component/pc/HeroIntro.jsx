'use client';

import {useEffect} from "react";

export default function HeroIntro({userName, phase, onEnter}) {
    useEffect(() => {
        const onWheel = (e) => {
            if (e.deltaY > 0) {
                onEnter();
            }
        };
        window.addEventListener('wheel', onWheel, {passive: true});
        return () => window.removeEventListener('wheel', onWheel);
    }, [onEnter]);

    return (<div className="absolute inset-0 z-20 overflow-hidden">
        <img
            src="/homecoming_main_img.png"
            alt=""
            className={`
          absolute inset-0 m-auto w-[72vw] max-w-[1400px]
          transition-opacity duration-1000 ease-out
          ${phase ? 'opacity-30' : 'opacity-100'}
        `}
        />

        {/* 글자: phase=1 되면 떠오르며 등장 */}
        <div className="absolute inset-0 grid place-items-center">
            <div
                className={`
            flex flex-col items-center -translate-y-4
            transition-all duration-1000 ease-out
            ${phase ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'}
          `}
            >
                <div className="flex items-center font-ocra tracking-tight text-[2.8vw] max-[1200px]:text-[44px]">
                    <span className="text-cred">G</span>
                    <span className="text-cgreen">D</span>
                    <span className="text-cyellow">G</span>
                    <span className="text-cblue">o</span>
                    <span className="text-cred mr-2">C</span>
                    <span className="text-white ml-1">INHA</span>
                </div>

                <p className="text-center text-white leading-snug text-[2.4vw] max-[1200px]:text-[34px]">
                    <span className="font-extrabold">제 1회 홈커밍 데이</span>에{' '}
                    {userName ? (<>
                        <span className="font-extrabold">{userName}</span>님을 초대합니다!
                    </>) : (<>여러분을 초대합니다!</>)}
                </p>
            </div>

            {/* 아래 화살표(인트로 전용) */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 h-[52px] w-[326px] animate-floatY">
                <div
                    className="absolute left-0 h-2 w-[169.5px] translate-y-[26px] rotate-15 rounded-full bg-cwhite"/>
                <div
                    className="absolute right-0 h-2 w-[169.5px] translate-y-[26px] -rotate-15 rounded-full bg-cwhite"/>
            </div>
        </div>
    </div>);
}