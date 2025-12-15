'use client';

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useSearchParams} from 'next/navigation';

import HeroIntro from './HeroIntro';
import FrameLayout from './FrameLayout';
import decodeHashToName from '../../util/decoder';

export default function HomecomingDesktop() {
    const sp = useSearchParams();
    const hash = sp.get('hash');
    const userName = useMemo(() => decodeHashToName(hash)?.trim() ?? '', [hash]);

    const [heroPhase, setHeroPhase] = useState(0);
    const [mode, setMode] = useState('hero'); // 'hero' | 'frame'
    const lockRef = useRef(false);

    useEffect(() => {
        const t = setTimeout(() => setHeroPhase(1), 500);
        return () => clearTimeout(t);
    }, []);

    const enterFrame = useCallback(() => {
        if (lockRef.current || mode === 'frame') return;
        lockRef.current = true;

        setTimeout(() => {
            setMode('frame');
            lockRef.current = false;
        }, 700);
    }, [mode]);

    return (<main className="fixed inset-0 bg-cblack overflow-hidden">
            <header className="absolute top-0 left-0 z-30">
                <img src="/images/logo.png" className="h-16 w-auto pl-10 pt-6" alt="GDGoC logo"/>
            </header>

            {/* Hero */}
            <div
                className={`
          absolute inset-0 z-20
          transition-all duration-700 ease-out
          ${mode === 'hero' ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.03] pointer-events-none'}
        `}
            >
                <HeroIntro userName={userName} phase={heroPhase} onEnter={enterFrame}/>
            </div>

            {/* Frame */}
            <div
                className={`
          absolute inset-0 z-10
          transition-all duration-700 ease-out
          ${mode === 'frame' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'}
        `}
            >
                <FrameLayout />
            </div>
        </main>);
}