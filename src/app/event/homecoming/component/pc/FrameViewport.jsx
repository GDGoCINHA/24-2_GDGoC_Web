'use client';

import React, {forwardRef} from 'react';
import FrameSection from './FrameSection';

const FrameViewport = forwardRef(function FrameViewport({onScroll}, ref) {
    return (<div
            ref={ref}
            onScroll={onScroll}
            className="
        relative
        h-full w-full
        overflow-y-auto no-scrollbar
        snap-y snap-mandatory
      "
        >
            <FrameSection><p>1st</p></FrameSection>
            <FrameSection><p>2nd</p></FrameSection>
            <FrameSection><p>3rd</p></FrameSection>
            <FrameSection><p>4th</p></FrameSection>
        </div>);
});

export default FrameViewport;