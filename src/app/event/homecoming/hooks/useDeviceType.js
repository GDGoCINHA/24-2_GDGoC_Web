'use client';

import { useEffect, useState } from 'react';

export function useDeviceType() {
    const [device, setDevice] = useState(null);

    useEffect(() => {
        const check = () => {
            if (typeof window === 'undefined') return;

            const width = window.innerWidth;
            setDevice(width <= 768 ? 'mobile' : 'desktop');
        };

        check();
        window.addEventListener('resize', check);

        return () => {
            window.removeEventListener('resize', check);
        };
    }, []);

    return device;
}