'use client';

export default function Frame() {
    return (<div className="absolute inset-0 w-[1400px] h-[1000px] m-auto pointer-events-none">
        {/* =====================
               상단 장식 라인
            ===================== */}
        <div className="absolute top-0 left-0 w-full h-60 overflow-visible">
            {/* 왼쪽 상단 라인 */}
            <div
                className="
                        absolute top-1/2 left-0
                        h-10 w-[732px]
                        rounded-full bg-cred
                        -translate-y-1/2
                        -rotate-15
                    "
            />

            {/* 오른쪽 상단 라인 */}
            <div
                className="
                        absolute top-1/2 right-0
                        h-10 w-[732px]
                        rounded-full bg-cblue
                        -translate-y-1/2
                        rotate-15
                    "
            />
        </div>

        {/* =====================
               하단 장식 라인
            ===================== */}
        <div className="absolute bottom-0 left-0 w-full h-10 overflow-visible">
            {/* 오른쪽 하단 라인 */}
            <div
                className="
                        absolute bottom-0 right-0
                        h-10 w-[720px]
                        rounded-full bg-cyellow
                    "
            />

            {/* 왼쪽 하단 라인 */}
            <div
                className="
                        absolute bottom-0 left-0
                        h-10 w-[720px]
                        rounded-full bg-cgreen
                    "
            />
        </div>
    </div>);
}