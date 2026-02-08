'use client'

export default function Frame() {
  return (
    <div className="absolute inset-0 w-[1400px] h-[1000px] m-auto pointer-events-none">
      {/* =====================
               상단 장식 라인
            ===================== */}
      <div className="absolute top-0 left-0 w-full h-60 overflow-visible">
        {/* 왼쪽 상단 라인 */}
        <div
          className="
                        absolute top-1/2 left-0
                        h-10 w-[732px]
                        rounded-full bg-red
                        -translate-y-1/2
                        -rotate-[15deg]
                    "
        />

        {/* 오른쪽 상단 라인 */}
        <div
          className="
                        absolute top-1/2 right-0
                        h-10 w-[732px]
                        rounded-full bg-blue
                        -translate-y-1/2
                        rotate-[15deg]
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
                        rounded-full bg-yellow
                    "
        />

        {/* 왼쪽 하단 라인 */}
        <div
          className="
                        absolute bottom-0 left-0
                        h-10 w-[720px]
                        rounded-full bg-green
                    "
        />
      </div>
    </div>
  )
}
