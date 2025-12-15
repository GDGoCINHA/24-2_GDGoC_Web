'use client';

import React, {useMemo} from 'react';
import {GoogleMap, Marker, useJsApiLoader} from '@react-google-maps/api';
import {useSearchParams} from "next/navigation";
import decodeHashToName from "@/app/event/homecoming/util/decoder";

export default function HomecomingInviteCard() {
    const sp = useSearchParams();
    const hash = sp.get('hash');
    const userName = useMemo(() => decodeHashToName(hash)?.trim() ?? '', [hash]);

    return (<div
        className="flex flex-col w-screen h-[calc(100dvh-64px)] pt-2 pb-12 rounded-t-[50px] bg-cblack overflow-hidden shadow-[0_-1.5px_#d9d9d940]">
        <div className="flex flex-col self-center w-[390px] h-[calc(100dvh-64px)]">
            {/* 상단 바 */}
            <div className="w-[30px] h-1 self-center bg-[#d9d9d9] rounded-full"/>

            {/* 상단 컬러 라인 */}
            <div className="flex justify-around items-center self-center relative h-[52px] w-[326px] mt-7">
                <div className="h-2 w-[169.5px] -rotate-15 rounded-full bg-cred absolute left-0"/>
                <div className="h-2 w-[169.5px] rotate-15 rounded-full bg-cblue absolute right-0"/>
            </div>

            <div
                className="w-[326px] h-[calc(100dvh-210px)] my-4 self-center overflow-hidden overflow-y-auto no-scrollbar">
                {/* GDGoC 로고 */}
                <div className="flex flex-col items-center">
                    <div className="flex items-center text-[28px] font-ocra tight-[-2.5%]">
                        <span className="text-cred">G</span>
                        <span className="text-cgreen">D</span>
                        <span className="text-cyellow">G</span>
                        <span className="text-cblue">o</span>
                        <span className="text-cred mr-2">C</span>
                        <span className="text-white ml-1">INHA</span>
                    </div>
                </div>

                {/* 초대 문구 */}
                <div className="text-center mb-12">
                    <p className="text-[24px] leading-snug tight-[-2.5%]">
                        <span className="font-extrabold">제 1회 홈커밍 데이</span>에
                        <br/>
                        {userName ? (<>
                                <span className="font-extrabold">{userName}</span>님을 초대합니다!
                            </>) : (<>여러분을 초대합니다!</>)}
                    </p>
                </div>

                {/* 내용 블록 */}
                <div className="space-y-4 text-[14px]">

                    {/* 일시 */}
                    <div className="flex-col gap-1">
                        <div className="shrink-0 text-white font-bold text-xl">일시</div>
                        <div className="flex-1">
                            <span className="font-semibold">2025년 12월 20일 (토) 16:00 ~</span>
                        </div>
                    </div>

                    {/* 일정 */}
                    <div className="flex-col gap-1">
                        <div className="shrink-0 text-white font-bold text-xl">프로그램</div>
                        <div className="flex-1 space-y-1">
                            <div className="flex gap-2">
                                <span className="font-bold w-[106px]">OB &amp; YB 네트워킹</span>
                                <span className="text-white text-[12px] pt-px">선후배 간의 네트워킹 프로그램</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="font-semibold w-[106px]">다과 및 경품 추첨</span>
                                <span className="text-white text-[12px] pt-px">네트워킹을 위한 다과와 이벤트</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="font-bold w-[106px]">전체 회식</span>
                                <span className="text-white text-[12px] pt-px">행사 종료 후 식당으로 이동</span>
                            </div>
                        </div>
                    </div>

                    {/* 장소 */}
                    <div className="flex-col gap-2">
                        <div className="shrink-0 text-white font-bold text-xl">장소</div>
                        <div className="flex-1">
                            <p className="font-bold">신한 스퀘어브릿지 인천</p>
                            <p className="text-white text-[12px]">(인천 연수구 컨벤시아대로 204 인스타2)</p>
                        </div>
                    </div>
                </div>

                {/* 지도 */}
                <HomecomingMap></HomecomingMap>
            </div>

            {/* 하단 장식 */}
            <div className="flex justify-around items-center self-center relative h-2 w-[326px]">
                <div className="absolute right-0 h-2 w-[166px] rounded-full bg-cyellow"/>
                <div className="absolute left-0 h-2 w-[166px] rounded-full bg-cgreen"/>
            </div>
        </div>
    </div>);
}


function HomecomingMap() {
    const {isLoaded, loadError} = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY, id: 'homecoming-map-script',
    });

    const center = {lat: 37.388493, lng: 126.639989};

    if (loadError) {
        return (<div
            className="rounded-2xl border border-red-300 bg-red-50 text-red-700 text-xs md:text-sm flex items-center justify-center h-[220px] md:h-[320px] lg:h-[420px]">
            지도를 불러오는 중 오류가 발생했습니다.
        </div>);
    }

    if (!isLoaded) {
        return (<div
            className="rounded-2xl border border-neutral-200 bg-neutral-100 text-neutral-500 text-xs md:text-sm flex items-center justify-center h-[220px] md:h-[320px] lg:h-[420px]">
            지도를 불러오는 중입니다...
        </div>);
    }

    return (<div className="mt-6 rounded-2xl h-[170px] overflow-hidden">
        <GoogleMap
            mapContainerClassName="w-full h-full"
            center={center}
            zoom={17}
            options={{disableDefaultUI: true, clickableIcons: false}}
        >
            <Marker position={center}/>
        </GoogleMap>
    </div>);
}