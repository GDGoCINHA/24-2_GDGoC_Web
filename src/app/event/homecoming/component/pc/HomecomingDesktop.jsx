'use client';

import {useEffect, useMemo, useState} from 'react';
import {useSearchParams} from 'next/navigation';

import HeroIntro from './HeroIntro';
import FrameLayout from './FrameLayout';

import decodeHashToName from '../../util/decoder';

export default function HomecomingDesktop() {
    const sp = useSearchParams();
    const hash = sp.get('hash');
    const userName = useMemo(() => decodeHashToName(hash)?.trim() ?? '', [hash]);

    const [heroPhase, setHeroPhase] = useState(0);
    const [showHero, setShowHero] = useState(true);

    useEffect(() => {
        const t = setTimeout(() => setHeroPhase(1), 500);
        return () => clearTimeout(t);
    }, []);

    return (<main className="fixed inset-0 bg-cblack overflow-hidden">

        <header className="absolute top-0 left-0 z-10">
            <img src="/logo.png" className="h-16 w-auto pl-10 pt-6" alt="GDGoC logo"/>
        </header>
            {/* Hero (1회성) */}
            {showHero && (<HeroIntro
                    userName={userName}
                    phase={heroPhase}
                    onEnter={() => setShowHero(false)}
                />)}

            {/* Frame (항상 고정) */}
            <FrameLayout visible={!showHero}/>
        </main>);
}