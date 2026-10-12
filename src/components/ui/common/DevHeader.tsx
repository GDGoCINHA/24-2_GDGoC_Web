import React from 'react'

/**
 * 안내 문구일 뿐이라 터치를 받지 않는다. 화면 맨 위 32px 을 투명하게 덮고 있어서,
 * 받게 두면 그 아래 헤더 버튼(운영·내 정보)의 윗부분이 눌리지 않는다 — dev 에서만 생기는 일이라 놓치기 쉽다.
 */
export default function DevHeader() {
  return (
    <>
      <div
        className="pointer-events-none fixed top-0 left-0 w-full h-8 bg-transparent text-red-500"
        style={{ zIndex: 999999 }}
      >
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold">Dev 서버입니다.</div>
        </div>
      </div>
    </>
  )
}
