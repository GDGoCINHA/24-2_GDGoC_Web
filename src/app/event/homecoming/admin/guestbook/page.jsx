'use client';

import { useState, useRef, useCallback } from "react";
import { useAuthenticatedApi } from "@/hooks/useAuthenticatedApi";
import { useGuestbookEntries } from "@/hooks/homecoming/useGuestbookEntries";
import GuestbookWordCloud from "@/components/event/homecoming/GuestbookWordCloud";

export default function GuestbookAdminPage() {
    const { entries, isLoading, error, lastSyncedAt, refresh } = useGuestbookEntries();
    const { apiClient } = useAuthenticatedApi();
    const [formValues, setFormValues] = useState({ wristbandSerial: "", name: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const statusTimerRef = useRef(null);

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
            await refresh();
        } catch (err) {
            console.error("방명록 등록 실패", err);
            const message = err?.response?.data?.message || "입장 등록에 실패했습니다.";
            setStatusMessage(message);
            resetStatusTimer();
        } finally {
            setIsSubmitting(false);
        }
    };

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
                <GuestbookWordCloud entries={entries} isLoading={isLoading} recentCount={5} />
            </section>

            <section className="relative z-10 w-full px-4 pb-12">
                <form
                    onSubmit={handleSubmit}
                    className="mx-auto w-full max-w-4xl bg-white border border-slate-200 rounded-[32px] p-8 flex flex-col gap-6 shadow-xl shadow-slate-100"
                >
                    <div className="flex flex-col gap-3 text-slate-700">
                        <h2 className="text-2xl font-semibold text-slate-900">입장 등록</h2>
                        <p className="text-sm">현재 {entries.length}명의 게스트가 입장했습니다.</p>
                        {error && <p className="text-sm text-cred">{error}</p>}
                    </div>
                    <div className="flex flex-col gap-4 md:flex-row">
                        <label className="flex-1 text-sm text-slate-600">
                            <span className="block mb-2 font-medium text-slate-800">손목띠지 번호</span>
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
                    </div>
                </form>
            </section>
        </div>
    );
}
