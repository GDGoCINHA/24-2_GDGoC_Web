'use client';

import {useEffect, useRef, useState} from 'react';
import HomecomingInviteCard from './HomecomingInviteCard';

export default function HomecomingMobile() {
    const MIN_TOP = 64;
    const IMAGE_HEIGHT = 278;
    const EXTRA_GAP = 24;

    const MAX_TOP = MIN_TOP + IMAGE_HEIGHT + EXTRA_GAP;

    const [top, setTop] = useState(MAX_TOP);
    const scrollRef = useRef(null);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const RANGE = IMAGE_HEIGHT + EXTRA_GAP; // 302

        const handleScroll = () => {
            const scrollY = el.scrollTop;

            const progress = Math.min(scrollY / RANGE, 1);
            const nextTop = MAX_TOP - RANGE * progress;

            setTop(nextTop);
        };

        handleScroll();
        el.addEventListener('scroll', handleScroll, {passive: true});
        return () => el.removeEventListener('scroll', handleScroll);
    }, []);

    return (<div
        ref={scrollRef}
        className="relative w-full h-dvh overflow-y-auto no-scrollbar"
    >
        {/* 상단 고정 영역 */}
        <div className="px-4 pt-4 fixed z-10">
            <header className="flex items-center gap-2 mb-6">
                <img src="/images/logo.png" alt="GDGoC logo" className="h-6 w-auto"/>
            </header>

            <div className="w-full max-w-[390px] left-1/2 -translate-x-1/2 fixed">
                <img
                    src="/images/homecoming/main_img.png"
                    alt="Homecoming illustration"
                    className="h-auto block"
                />
            </div>
        </div>

        {/* 카드 */}
        <div
            className="absolute left-1/2 -translate-x-1/2 transition-[top] duration-300 ease-out z-10"
            style={{top: `${top}px`}}
        >
            <HomecomingInviteCard/>
        </div>
    </div>);
}