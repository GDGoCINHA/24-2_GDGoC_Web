import React from 'react'

export default function DevHeader() {
  return (
    <>
        <div className="fixed top-0 left-0 w-full h-8 bg-transparent text-red-500" style={{zIndex: 999999}}>
            <div className="flex justify-between items-center">
                <div className="text-2xl font-bold">Dev 서버입니다.</div>
            </div>
        </div>
    </>
  )
}