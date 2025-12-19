'use client';

import { useAuthenticatedApi } from "@/hooks/useAuthenticatedApi";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const REFRESH_INTERVAL = 10000;

const hashString = (value) => {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
        hash = value.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
};

const mapToRange = (value, min, max) => {
    const normalized = Math.abs(value % 1000) / 1000;
    return min + normalized * (max - min);
};

export default function GuestbookAdminPage() {
    const { apiClient } = useAuthenticatedApi();
    const [entries, setEntries] = useState([]);
    const [formValues, setFormValues] = useState({ wristbandSerial: "", name: "" });
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [statusMessage, setStatusMessage] = useState("");
    const [lastSyncedAt, setLastSyncedAt] = useState(null);
    const statusTimerRef = useRef(null);

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

        return () => {
            clearInterval(interval);
        };
    }, [fetchEntries]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormValues((prev) => ({ ...prev, [name]: value }));
    };

    const resetStatusTimer = useCallback(() => {
        if (statusTimerRef.current) {
            clearTimeout(statusTimerRef.current);
        }
        statusTimerRef.current = setTimeout(() => setStatusMessage(""), 2500);
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!formValues.wristbandSerial.trim() || !formValues.name.trim()) {
            return;
        }

        try {
            setIsSubmitting(true);
            await apiClient.post("/guestbook/entries", {
                wristbandSerial: formValues.wristbandSerial.trim(),
                name: formValues.name.trim(),
            });
            setFormValues({ wristbandSerial: "", name: "" });
            setStatusMessage("입장 등록이 완료되었습니다.");
            resetStatusTimer();
            await fetchEntries();
        } catch (err) {
            console.error("방명록 등록 실패", err);
            const message = err?.response?.data?.message || "입장 등록에 실패했습니다.";
            setStatusMessage(message);
            resetStatusTimer();
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        return () => {
            if (statusTimerRef.current) {
                clearTimeout(statusTimerRef.current);
            }
        };
    }, []);

    const words = useMemo(() => {
        if (!entries.length) {
            return [];
        }

        const recentThreshold = Math.max(entries.length - 5, 0);

        return entries.map((entry, idx) => {
            const key = entry.id ?? `${entry.wristbandSerial ?? "unknown"}-${idx}`;
            const baseHash = hashString(`${key}-${entry.name}`);
            const top = mapToRange(baseHash, 8, 92);
            const left = mapToRange(baseHash * 3, 12, 88);
            const fontSize = mapToRange(baseHash * 5, 0.9, 2.6);
            const rotate = mapToRange(baseHash * 7, -12, 12);
            const opacity = mapToRange(baseHash * 11, 0.35, 0.85);

            return {
                key,
                label: entry.name,
                isRecent: idx >= recentThreshold,
                style: {
                    top: `${top}%`,
                    left: `${left}%`,
                    fontSize: `${fontSize}rem`,
                    opacity,
                    transform: `translate(-50%, -50%) rotate(${rotate}deg)`,
                },
            };
        });
    }, [entries]);

    const isSubmitDisabled = isSubmitting || !formValues.wristbandSerial.trim() || !formValues.name.trim();

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#F5F9FF] via-[#FFFFFF] to-[#EEF2FF] text-slate-900 flex flex-col">
            <section className="relative flex-1 overflow-hidden">
                <div
                    className="absolute inset-0 opacity-60 pointer-events-none"
                    style={{
                        background:
                            "radial-gradient(circle at 25% 20%, rgba(66,133,244,0.25), transparent 40%), " +
                            "radial-gradient(circle at 75% 15%, rgba(251,188,5,0.20), transparent 35%), " +
                            "radial-gradient(circle at 50% 70%, rgba(52,168,83,0.18), transparent 45%)",
                    }}
                />
                <div className="absolute inset-0 pointer-events-none select-none">
                    {words.length ? (
                        words.map((word) => (
                            <span
                                key={word.key}
                                style={word.style}
                                className={`absolute font-semibold tracking-wide drop-shadow-[0_2px_12px_rgba(15,23,42,0.08)] transition-all duration-700 ease-in-out ${word.isRecent ? "text-cblue" : "text-slate-500"}`}
                            >
                                {word.label}
                            </span>
                        ))
                    ) : (
                        !isLoading && (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-lg">
                                아직 등록된 입장 정보가 없습니다.
                            </div>
                        )
                    )}
                </div>
            </section>

            <section className="relative z-10 w-full px-4 pb-12">
                <form
                    onSubmit={handleSubmit}
                    className="mx-auto w-full max-w-4xl bg-white border border-slate-200 rounded-[32px] p-8 flex flex-col gap-6 shadow-xl shadow-slate-100"
                >
                    <div className="flex flex-col gap-3 text-slate-700">
                        <h2 className="text-2xl font-semibold text-slate-900">입장 등록</h2>
                        <p className="text-sm">현재 {entries.length}명의 게스트가 입장했습니다.</p>
                    </div>
                    <div className="flex flex-col gap-4 md:flex-row">
                        <label className="flex-1 text-sm text-slate-600">
                            <span className="block mb-2 font-medium text-slate-800">손목밴드 번호</span>
                            <input
                                name="wristbandSerial"
                                value={formValues.wristbandSerial}
                                onChange={handleChange}
                                placeholder="예: 12"
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cblue focus:bg-white transition-all"
                                autoComplete="off"
                                inputMode="numeric"
                            />
                        </label>
                        <label className="flex-1 text-sm text-slate-600">
                            <span className="block mb-2 font-medium text-slate-800">이름</span>
                            <input
                                name="name"
                                value={formValues.name}
                                onChange={handleChange}
                                placeholder="이름을 입력해주세요"
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cblue focus:bg-white transition-all"
                                autoComplete="off"
                            />
                        </label>
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitDisabled}
                        className="w-full rounded-2xl bg-gradient-to-r from-[#60A5FA] to-[#34D399] py-4 text-lg font-semibold text-white transition disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400"
                    >
                        {isSubmitting ? "등록 중..." : "방명록 등록"}
                    </button>
                    <div className="text-sm text-slate-600 min-h-[20px]">
                        {statusMessage && <p className="text-cgreen">{statusMessage}</p>}
                        {lastSyncedAt && (
                            <p className="text-slate-400 mt-1">
                                마지막 동기화: {lastSyncedAt.toLocaleTimeString("ko-KR", { hour12: false })}
                            </p>
                        )}
                        {error && <p className="text-cred mt-1">{error}</p>}
                    </div>
                </form>
            </section>
        </div>
    );
}
