'use client';

import {useRef, useState} from 'react';
import Frame from './Frame';
import FrameViewport from './FrameViewport';
import ScrollDots from './ScrollDots';

export default function FrameLayout() {
    const viewportRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const TOTAL = 5;
    const SCROLL_DAMPING = 0.2;
    const MAX_DELTA = 60;

    const onScroll = () => {
        const el = viewportRef.current;
        if (!el) return;
        const idx = Math.round(el.scrollTop / el.clientHeight);
        setActiveIndex(idx);
    };

    const onJump = (index) => {
        const el = viewportRef.current;
        if (!el) return;
        el.scrollTo({top: index * el.clientHeight, behavior: 'auto'});
    };

    const onWheel = (e) => {
        const el = viewportRef.current;
        if (!el) return;

        const raw = e.deltaY;
        const clamped = Math.max(-MAX_DELTA, Math.min(MAX_DELTA, raw));
        const delta = clamped * SCROLL_DAMPING;

        const atTop = el.scrollTop <= 0;
        const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
        const canScrollInside = (delta > 0 && !atBottom) || (delta < 0 && !atTop);

        if (!canScrollInside) return;

        e.preventDefault();
        el.scrollTop += delta;
    };

    return (<div
        className={`
        absolute inset-0 w-[1400px] h-[1000px] m-auto pt-60 pb-10
      `}
        onWheel={onWheel}
    >
        <Frame/>

        <div className="relative h-full w-full pointer-events-auto">
            <FrameViewport ref={viewportRef} onScroll={onScroll}/>
        </div>

        <ScrollDots count={TOTAL} activeIndex={activeIndex} onJump={onJump}/>
    </div>);
}