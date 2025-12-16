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
        <FrameSection><FifthSection/></FrameSection>
    </div>);
});

export default FrameViewport;

function FirstSection() {
    return (<div className="flex flex-col justify-center text-cwhite">
        <div className="flex items-center font-ocra tracking-tight text-6xl self-center font-bold">
            <span className="text-cred">G</span>
            <span className="text-cgreen">D</span>
            <span className="text-cyellow">G</span>
            <span className="text-cblue">o</span>
            <span className="text-cred mr-2">C</span>
            <span className="text-cwhite ml-1">INHA</span>
        </div>

        <div className="mt-8 flex text-8xl self-center font-bold">제 1회 홈커밍 데이</div>

        <p className="mt-20 px-24 text-2xl leading-relaxed">
            <strong>GDGoC HomeComing : Networking with INCHEON</strong>은
            <br/>
            오후 1시 입장을 시작으로, <strong>1부 프로젝트 성과 발표회</strong>와 <strong>시상</strong>,
            <br/>
            이후 <strong>오프닝 특강</strong>과 <strong>연간 활동 소개</strong>, <strong>OB 및 초청자 인사</strong>를 거쳐
            <br/>
            <strong>팀별 경쟁 게임·퀴즈·자유 네트워킹</strong>으로 이어지는 구성입니다.
            <br/>
            행사는 <strong>13:00–19:00</strong>까지 진행되며,
            <br/>
            마지막에는 <strong>전체 교류 마무리 후 뒤풀이 이동</strong>으로 마무리됩니다.
        </p>
    </div>);
}

/* 2) 3컬럼 타임테이블(전체 요약) */
function SecondSection() {
    return (<div className="flex flex-col text-cwhite">
        <div className="text-6xl self-center font-bold">타임테이블</div>
        <div className="mt-16 grid grid-cols-2 text-large gap-12 px-24">
            {/* Col 1 */}
            <div>
                <TimeRow time="13:00–13:20" title="참가자 입장 및 체크인" desc="오프닝 안내 · 활동 소개 영상 상영"/>
                <TimeRow time="13:20–13:30" title="1부 라운드 운영 방식 안내" desc="팀별 데모 시연 및 발표 준비"/>

                <TimeRow time="13:30–15:10" title="프로젝트 성과 발표 및 데모 시연" desc="총 6라운드 · 상호 피드백 · QnA"/>
                <TimeRow time="15:10–15:30" title="심사 집계 및 시상식" desc="1부 종료"/>
            </div>

            {/* Col 3 */}
            <div>
                <TimeRow time="15:30–16:00" title="2부 입장"/>
                <TimeRow
                    time="16:00–16:40"
                    title="오프닝 특강"
                    desc={<>
                        GDG Campus Korea 김대현님
                    </>}
                />
                <TimeRow time="16:40–17:00" title="GDGoC INHA 연간 활동 소개"/>
                <TimeRow time="17:00–17:30" title="OB 및 초청자 인사"/>
                <TimeRow time="17:30–18:30" title="네트워킹 게임 및 퀴즈"/>
                <TimeRow time="18:30–19:00" title="자유 네트워킹"/>
                <TimeRow time="19:00–" title="뒤풀이 진행"/>
            </div>
        </div>

        <div className="mt-14 px-24 text-cwhite/80 text-lg leading-snug">
            • 1부 참석자: <span className="font-semibold text-cwhite">12:50</span>까지 도착<br/>
            • 2부 참석자: <span className="font-semibold text-cwhite">15:20</span>까지 도착
        </div>
    </div>);
}

/* 3) 1부 상세 (2컬럼 리스트) */
function ThirdSection() {
    return (<div className="flex flex-col text-cwhite">
        <div className="text-6xl self-center font-bold">1부 · GOAT 프로젝트 데모데이</div>
        <div className="mt-6 text-2xl self-center text-cwhite/80">13:00–15:30</div>

        <div className="mt-16 grid justify-items-center text-large gap-16 px-24">
            <div>
                <TimeRow time="13:00–13:20" title="입장 및 체크인" desc="오프닝 안내 · 활동 소개 영상"/>
                <TimeRow time="13:20–13:30" title="운영 방식 안내" desc="라운드 운영 · 발표 준비"/>
                <TimeRow time="13:30–15:10" title="성과 발표/데모 (6라운드)" desc="데모 피칭 · 상호 피드백 · QnA"/>
                <TimeRow time="15:10–15:30" title="심사 집계 및 시상식"/>
            </div>
        </div>
    </div>);
}

/* 4) 2부 카드형 */
function FourthSection() {
    return (<div className="flex flex-col text-cwhite">
        <div className="text-6xl self-center font-bold">2부 · Networking with INCHEON</div>
        <div className="mt-6 text-2xl self-center text-cwhite/80">15:30–19:00</div>

        <div className="mt-16 grid grid-cols-2 gap-12 px-24">
            <div className="rounded-2xl bg-white/5 p-10">
                <div className="text-3xl font-bold mb-6">오프닝 & 소개</div>
                <TimeRow time="15:30–16:00" title="2부 입장"/>
                <TimeRow time="16:00–16:40" title="오프닝 특강" desc="GDG Campus Korea 김대현님"/>
                <TimeRow time="16:40–17:00" title="연간 활동 소개" desc="GDGoC INHA"/>
                <TimeRow time="17:00–17:30" title="OB 및 초청자 인사"/>
            </div>

            <div className="rounded-2xl bg-white/5 p-10">
                <div className="text-3xl font-bold mb-6">게임 & 네트워킹</div>
                <TimeRow time="17:30–18:30" title="네트워킹 게임/퀴즈"/>
                <TimeRow time="18:30–19:00" title="자유 네트워킹"/>
                <TimeRow time="19:00–" title="뒤풀이 진행" desc="전체 네트워킹 마무리 후 이동"/>
            </div>
        </div>
    </div>);
}

/* 5) 장소 + 지도 */
function FifthSection() {
    return (<div className="flex flex-col text-cwhite">
        <div className="text-5xl self-center font-bold">신한 스퀘어 브릿지 인천</div>
        <div className="mt-6 text-2xl self-center text-cwhite/80">
            (인천광역시 연수구 컨벤시아대로 204 인스타2)
        </div>

        <HomecomingMap/>

        <div className="mt-14 px-24 text-cwhite/80 text-lg">
            문의: <span className="font-semibold text-cwhite">010-2087-1816</span>
        </div>
    </div>);
}

function TimeRow({time, title, desc}) {
    return (<div className="flex gap-6 py-2 font-xl">
        <div className="w-[140px] shrink-0 font-bold text-cwhite">{time}</div>
        <div className="flex-1">
            <div className="font-semibold text-cwhite">{title}</div>
            {desc ? <div className="text-cwhite/70 leading-snug">{desc}</div> : null}
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