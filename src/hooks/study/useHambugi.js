import { useEffect, useState } from 'react';

export const useHambugi = () => {
    const [isHambugi, setIsHambugi] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        try {
            if (process.env.NODE_ENV === 'development') {
                setIsHambugi(false);
            } else {
                const checkTime = () => {
                    const now = new Date();
                    const currentTime = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
                    const noonTime = 12 * 3600;
                    const midnightTime = 24 * 3600;
                    const fiveMinutes = 3 * 60;

                    const isNearNoon = Math.abs(currentTime - noonTime) <= fiveMinutes;
                    const isNearMidnight = currentTime <= fiveMinutes || Math.abs(currentTime - midnightTime) <= fiveMinutes;

                    if (isNearNoon || isNearMidnight) {
                        setIsHambugi(true);
                    } else {
                        setIsHambugi(false);
                    }
                };

                checkTime();
                const interval = setInterval(checkTime, 5 * 60 * 1000);

                return () => clearInterval(interval);
            }
        } catch (e) {
            console.error('Error checking time:');
            setError(e);
        }
    }, []);

    return { isHambugi, error };
};