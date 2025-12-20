'use client';

import { useAuthenticatedApi } from "@/hooks/useAuthenticatedApi";
import { useCallback, useEffect, useState } from "react";

const REFRESH_INTERVAL = 10000;

export const useGuestbookEntries = () => {
    const { apiClient } = useAuthenticatedApi();
    const [entries, setEntries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [lastSyncedAt, setLastSyncedAt] = useState(null);

    const fetchEntries = useCallback(async () => {
        try {
            setError("");
            const res = await apiClient.get("/guestbook/entries");
            setEntries(res?.data?.data ?? []);
            setLastSyncedAt(new Date());
        } catch (err) {
            console.error("방명록 목록 조회 실패", err);
            setError("방명록 목록을 불러오지 못했습니다.");
        } finally {
            setIsLoading(false);
        }
    }, [apiClient]);

    useEffect(() => {
        fetchEntries();
        const interval = setInterval(fetchEntries, REFRESH_INTERVAL);
        return () => clearInterval(interval);
    }, [fetchEntries]);

    return { entries, isLoading, error, lastSyncedAt, refresh: fetchEntries };
};
