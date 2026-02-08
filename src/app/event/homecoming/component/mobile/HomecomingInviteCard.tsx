'use client'

import React, { useMemo } from 'react'
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'
import { useSearchParams } from 'next/navigation'
import decodeHashToName from '@/app/event/homecoming/util/decoder'

export default function HomecomingInviteCard() {
  const sp = useSearchParams()
  const hash = sp.get('hash')
  const userName = useMemo(() => decodeHashToName(hash)?.trim() ?? '', [hash])

  return (
    <div className="flex flex-col w-screen h-[calc(100dvh-64px)] pt-2 pb-12 rounded-t-[50px] text-white bg-black overflow-hidden shadow-[0_-1.5px_#d9d9d940]">
      <div className="flex flex-col self-center w-[390px] h-[calc(100dvh-64px)]">
        {/* 상단 바 */}
        <div className="w-[30px] h-1 self-center bg-[#d9d9d9] rounded-full" />

        {/* 상단 컬러 라인 */}
        <div className="flex justify-around items-center self-center relative h-[52px] w-[326px] mt-7">
          <div className="h-2 w-[169.5px] -rotate-[15deg] rounded-full bg-red absolute left-0" />
          <div className="h-2 w-[169.5px] rotate-[15deg] rounded-full bg-blue absolute right-0" />
        </div>

        <div className="w-[326px] h-[calc(100dvh-210px)] my-4 self-center overflow-hidden overflow-y-auto no-scrollbar">
          {/* GDGoC 로고 */}
          <div className="flex flex-col items-center">
            <div className="flex items-center text-[28px] font-ocra tight-[-2.5%]">
              <span className="text-red">G</span>
              <span className="text-green">D</span>
              <span className="text-yellow">G</span>
              <span className="text-blue">o</span>
              <span className="text-red mr-2">C</span>
              <span className="text-white ml-1">INHA</span>
            </div>
          </div>

          {/* 초대 문구 */}
          <div className="text-center mb-12 text-white">
            <p className="text-[24px] tight-[-2.5%]">
              <span className="font-bold">제 1회 홈커밍 데이</span>에
              <br />
              {userName ? (
                <>
                  <span className="font-extrabold">{userName}</span>님을 초대합니다!
                </>
              ) : (
                <>여러분을 초대합니다!</>
              )}
            </p>
          </div>

          {/* 내용 블록 */}
          <div className="space-y-4 text-[14px] text-white">
            {/* 일시 */}
            <div className="flex-col gap-1">
              <div className="shrink-0 text-white font-bold text-xl">일시</div>
              <div className="flex-1 space-y-1">
                <div>
                  <span className="font-semibold">2025년 12월 20일 (토) 13:00 ~ 19:00</span>
                </div>
                <div className="text-white text-[12px] leading-snug">
                  * 19:00 이후 뒤풀이 장소로 함께 이동하며 마무리합니다.
                </div>
              </div>
            </div>

            {/* 프로그램 */}
            <div className="flex-col gap-1">
              <div className="shrink-0 text-white font-bold text-xl">프로그램</div>

              <div className="flex-1 space-y-4">
                {/* 요약 */}
                <div className="text-white/90 text-[12px] leading-snug">
                  오후 1시 입장을 시작으로, 1부 프로젝트 성과 발표회와 시상,
                  <br />
                  이후 오프닝 특강과 연간 활동 소개, OB 및 초청자 인사를 거쳐
                  <br />
                  팀별 경쟁 게임·퀴즈·자유 네트워킹으로 이어지는 구성입니다.
                  <br />
                  행사는 13:00–19:00까지 진행되며,
                  <br />
                  마지막에는 전체 교류 마무리 후 뒤풀이 이동으로 마무리됩니다.
                </div>

                {/* 1부 */}
                <div className="space-y-2">
                  <div className="text-white font-bold">
                    1부 (13:00–15:30) · GOAT 프로젝트 데모데이
                  </div>

                  <div className="space-y-1">
                    <div className="flex gap-2">
                      <span className="font-bold w-[106px]">13:00–13:20</span>
                      <span className="text-white text-[12px] pt-px">
                        입장/체크인 · 오프닝 안내 · 활동 소개 영상
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-bold w-[106px]">13:20–13:30</span>
                      <span className="text-white text-[12px] pt-px">
                        라운드 운영 안내 · 발표 준비
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-bold w-[106px]">13:30–15:10</span>
                      <span className="text-white text-[12px] pt-px">
                        프로젝트 성과 발표/데모 (총 6라운드) · QnA
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-bold w-[106px]">15:10–15:30</span>
                      <span className="text-white text-[12px] pt-px">심사 집계 · 시상식</span>
                    </div>
                  </div>
                </div>

                {/* 2부 */}
                <div className="space-y-2">
                  <div className="text-white font-bold">2부 (15:30–19:00) · IN·Fest</div>

                  <div className="space-y-1">
                    <div className="flex gap-2">
                      <span className="font-bold w-[106px]">15:30–16:00</span>
                      <span className="text-white text-[12px] pt-px">2부 입장</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-bold w-[106px]">16:00–16:40</span>
                      <span className="text-white text-[12px] pt-px">
                        오프닝 특강
                        <br />
                        <span className="text-white/80"> GDG Campus Korea 김대현님</span>
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-bold w-[106px]">16:40–17:00</span>
                      <span className="text-white text-[12px] pt-px">
                        GDGoC INHA 연간 활동 소개
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-bold w-[106px]">17:00–17:30</span>
                      <span className="text-white text-[12px] pt-px">OB 및 초청자 인사</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-bold w-[106px]">17:30–18:30</span>
                      <span className="text-white text-[12px] pt-px">
                        네트워킹 게임 · 퀴즈 프로그램
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-bold w-[106px]">18:30–19:00</span>
                      <span className="text-white text-[12px] pt-px">자유 네트워킹</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-bold w-[106px]">19:00–</span>
                      <span className="text-white text-[12px] pt-px">뒤풀이 진행</span>
                    </div>
                  </div>
                </div>

                {/* 도착 안내 */}
                <div className="space-y-1 pt-1">
                  <div className="text-white font-bold">도착 안내</div>
                  <div className="text-white text-[12px] leading-snug">
                    • 1부 참석자: <span className="font-semibold">12:50</span>까지 도착
                    <br />• 2부 참석자: <span className="font-semibold">15:50</span>까지 도착
                  </div>
                </div>

                {/* 문의 */}
                <div className="space-y-1 pt-1">
                  <div className="text-white font-bold">문의</div>
                  <div className="text-white text-[12px] leading-snug">
                    행사 관련 문의: <span className="font-semibold">010-2087-1816</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 장소 */}
            <div className="flex-col gap-2">
              <div className="shrink-0 text-white font-bold text-xl">장소</div>
              <div className="flex-1">
                <p className="font-bold">신한 스퀘어 브릿지 인천</p>
                <p className="text-white text-[12px]">
                  (인천광역시 연수구 컨벤시아대로 204, 인스타2)
                </p>
              </div>
            </div>

            {/* 지도 */}
            <HomecomingMap />
          </div>
        </div>

        {/* 하단 장식 */}
        <div className="flex justify-around items-center self-center relative h-2 w-[326px]">
          <div className="absolute right-0 h-2 w-[166px] rounded-full bg-yellow" />
          <div className="absolute left-0 h-2 w-[166px] rounded-full bg-green" />
        </div>
      </div>
    </div>
  )
}

function HomecomingMap() {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    id: 'homecoming-map-script'
  })

  const center = { lat: 37.388493, lng: 126.639989 }

  if (loadError) {
    return (
      <div className="rounded-2xl border border-red-300 bg-red-50 text-red-700 text-xs md:text-sm flex items-center justify-center h-[220px] md:h-[320px] lg:h-[420px]">
        지도를 불러오는 중 오류가 발생했습니다.
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-neutral-100 text-neutral-500 text-xs md:text-sm flex items-center justify-center h-[220px] md:h-[320px] lg:h-[420px]">
        지도를 불러오는 중입니다...
      </div>
    )
  }

  return (
    <div className="mt-6 rounded-2xl h-[170px] overflow-hidden">
      <GoogleMap
        mapContainerClassName="w-full h-full"
        center={center}
        zoom={17}
        options={{ disableDefaultUI: true, clickableIcons: false }}
      >
        <Marker position={center} />
      </GoogleMap>
    </div>
  )
}
