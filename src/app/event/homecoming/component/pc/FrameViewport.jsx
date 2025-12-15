'use client';

import React, {forwardRef} from 'react';
import FrameSection from './FrameSection';
import {GoogleMap, Marker, useJsApiLoader} from "@react-google-maps/api";

const FrameViewport = forwardRef(function FrameViewport({onScroll}, ref) {
    return (<div
        ref={ref}
        onScroll={onScroll}
        className="
        relative
        h-full w-full
        overflow-y-auto no-scrollbar snap-y snap-mandatory font-pretendard text-cwhite
      "
    >
        <FrameSection><FirstSection/></FrameSection>
        <FrameSection><SecondSection/></FrameSection>
        <FrameSection><ThirdSection/></FrameSection>
        <FrameSection><FourthSection/></FrameSection>
    </div>);
});

export default FrameViewport;

function FirstSection() {
    return (<div className="flex flex-col justify-center pt-16">
        {/* 로고 */}
        <div className="flex items-center font-ocra tracking-tight text-6xl self-center font-bold">
            <span className="text-cred">G</span>
            <span className="text-cgreen">D</span>
            <span className="text-cyellow">G</span>
            <span className="text-cblue">o</span>
            <span className="text-cred mr-2">C</span>
            <span className="text-cwhite ml-1">INHA</span>
        </div>
        <div className="mt-8 flex text-8xl self-center font-bold">제 1회 홈커밍 데이</div>
        <p className="mt-20 pl-80"><strong>GDGoC HomeComing : Networking with INCHEON</strong>은
            <br/>
            오후 1시 입장을 시작으로, <strong>1부 프로젝트 성과 발표회</strong>와 <strong>시상</strong>,
            <br/>
            이후 <strong>특강 세션과 Cross-Chapter 오프닝</strong>을 거쳐
            <br/>
            <strong>팀별 경쟁 게임·퀴즈·네트워킹 프로그램</strong>으로 이어지는 구성입니다.
            <br/>
            행사는 <strong>13:00–19:00</strong>까지 진행되며,
            <br/>
            마지막에는 <strong>전체 교류를 마무리하는 네트워킹 및 뒤풀이 이동</strong>으로 마무리됩니다.</p>
    </div>);
}

function SecondSection() {
    return (<div className="flex flex-col text-center">
        <div className="flex items-center text-6xl self-center font-bold">
            2025년 12월 20일 (토)
        </div>
        <div className="mt-8 flex items-center text-5xl self-center font-bold left-1/3">
            1부
        </div>

    </div>)
}

function ThirdSection() {
    return (<div className="flex flex-col text-center">
        <div className="flex items-center text-6xl self-center font-bold">
            2025년 12월 20일 (토)
        </div>
        <div className="mt-8 flex items-center text-5xl self-center font-bold left-1/3">
            2부
        </div>

    </div>)
}

function FourthSection() {
    return (<div className="flex flex-col text-center">
        <div className="flex items-center text-6xl self-center font-bold">
            신한 스퀘어 브릿지 인천
        </div>
        <div className="mt-8 flex items-center text-2xl self-center font-medium">
            (인천광역시 연수구 컨벤시아대로 204 인스타2)
        </div>

        <HomecomingMap/>
    </div>)

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

    return (<div className="mt-16 rounded-2xl w-[1000px] h-[400px] overflow-hidden self-center">
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