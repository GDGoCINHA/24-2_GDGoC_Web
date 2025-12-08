'use client';

import {useState} from 'react';
import {GoogleMap, Marker, useJsApiLoader} from '@react-google-maps/api';
import Image from 'next/image';

export default function HomecomingPage() {
    const [showInvitation, setShowInvitation] = useState(false);

    return (<main className="relative flex min-h-screen justify-center overflow-hidden">
        {/* 🔥 모바일/태블릿: 화면에 딱 고정되는 배경 (fixed) */}
        <div
            className="
                    fixed inset-0 -z-10
                    h-screen
                    bg-[url('/images/homecoming/bg.png')]
                    bg-cover bg-center bg-no-repeat
                    md:hidden
                "
        />

        {/* 💻 PC: 내용 높이만큼 아래로 늘어나는 배경 */}
        <div
            className="
                    hidden md:block
                    absolute inset-0 -z-10
                    bg-[url('/images/homecoming/bg.png')]
                    bg-cover bg-center bg-no-repeat
                "
        />

        {/* 1920px 기준 캔버스 */}
        <div className="relative w-full max-w-[1920px]">

            {/* 실제 콘텐츠 */}
            <div className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-col px-4 py-10 md:py-16">
                {showInvitation ? (<Invitation onBack={() => setShowInvitation(false)}/>) : (
                    <Hero onOpenInvitation={() => setShowInvitation(true)}/>)}
            </div>
        </div>
    </main>);
}

/* ===============================
   Hero 컴포넌트
================================ */
function Hero({onOpenInvitation}) {
    return (<div className="flex flex-1 flex-col items-center gap-8 text-center">
        <Image
            src="/images/homecoming/main_img.png"
            width={329}
            height={235}
            alt="GDGoC INHA Homecoming Day Illustration"
            priority
            className="w-full max-w-2xl mt-[calc(50vh-235px)] md:mt-[100px] md:max-w-[790px]"
        />


        <h1 className="text-2xl font-extrabold leading-tight text-neutral-900 md:text-4xl lg:text-5xl">
            GDGoC INHA
            <br/>
            제1회 홈커밍데이에 초대합니다!
        </h1>

        <button
            type="button"
            onClick={onOpenInvitation}
            className="mt-2 rounded-full bg-white px-10 py-3 text-base font-semibold text-neutral-900 shadow-md transition hover:bg-neutral-50 hover:shadow-lg"
        >
            초대장 펼쳐보기
        </button>
    </div>);
}

/* ===============================
   Invitation 컴포넌트
================================ */
function Invitation({onBack}) {
    return (<div className="flex w-full justify-center px-3 md:px-0">
        {/* 초대장 카드 */}
        <div
            className="w-full max-w-[1100px] rounded-3xl bg-white/90 shadow-xl backdrop-blur-sm px-5 py-7 md:px-10 md:py-10 text-neutral-900">

            {/* 상단 라벨 + 뒤로가기 */}
            <div className="mb-4 flex items-center justify-between">
                    <span className="text-[11px] md:text-xs font-medium text-neutral-500 tracking-[0.18em] uppercase">
                        Invitation
                    </span>
                {onBack && (<button
                    type="button"
                    onClick={onBack}
                    className="inline-flex items-center gap-1 rounded-full bg-neutral-900/5 px-3 py-1.5 text-[11px] font-medium text-neutral-800 hover:bg-neutral-900/10"
                >
                    ← 메인으로
                </button>)}
            </div>

            {/* 1. 소개 */}
            <section className="mb-8 md:mb-10 text-center">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold">
                    GDGoC INHA{" "}
                    <br className="block md:hidden"/>
                    제1회 홈커밍 데이
                </h1>
                <p className="mt-2 text-[11px] md:text-xs tracking-wide text-neutral-500">
                    GDGoC INHA Homecoming Day 2025
                </p>

                <div
                    className="
      mt-6 space-y-3
      text-[13px] md:text-sm leading-relaxed text-neutral-900/90
      max-w-[720px] mx-auto
      text-left md:text-center
    "
                >
                    {/* 1줄 소개 */}
                    <p>
                        GDGoC INHA가 처음으로 선보이는{" "}
                        <strong>제1회 홈커밍 데이(Homecoming Day)</strong>가 열립니다!
                    </p>

                    {/* 2번째 문장: 굵은 부분은 데스크탑에서 따로 줄바꿈 */}
                    <p>
                        이번 행사는 현역 부원과 OB, 그리고 GDG 커뮤니티에 관심 있는 모든 분들이 한자리에 모여
                        <br className="hidden md:block"/>
                        <span className="font-semibold">
        프로젝트 성과 공유 · 기술 교류 · 커뮤니티 네트워킹
      </span>
                        을 함께 나누는 뜻깊은 자리입니다.
                    </p>

                    {/* 3번째 문장 */}
                    <p>
                        한 해 동안의 활동을 돌아보고, 앞으로 GDGoC INHA가 만들어갈 방향을 함께 이야기하며
                        <br className="hidden md:block"/>
                        커뮤니티의 가치를 더욱 확장하는 의미 있는 시간을 준비했습니다.
                    </p>
                </div>
            </section>

            {/* 2~3. 일시/장소 + 프로그램 (PC에서 2열 배치) */}
            <section className="mb-8 md:mb-10 md:grid md:grid-cols-2 md:gap-8 text-left md:text-center">
                {/* 왼쪽 컬럼: 일시 + 장소 */}
                <div
                    className="space-y-5 md:pr-6 border-b md:border-b-0 md:border-r border-neutral-200 pb-6 md:pb-0">
                    {/* 일시 */}
                    <div>
                        <h2 className="text-sm md:text-base font-bold text-neutral-900 mb-1.5">
                            일시
                        </h2>
                        <p className="text-xs md:text-sm font-medium text-neutral-900">
                            2025년 12월 20일 (토)
                        </p>
                    </div>

                    {/* 장소 */}
                    <div>
                        <h2 className="text-sm md:text-base font-bold text-neutral-900 mb-1.5">
                            장소
                        </h2>
                        <p className="text-xs md:text-sm font-medium text-neutral-900 leading-relaxed">
                            신한 스퀘어 브릿지 인천
                            <br/>
                            (인천 연수구 컨벤시아대로 204 인스타2)
                        </p>
                    </div>
                </div>

                {/* 오른쪽 컬럼: 프로그램 안내 */}
                <div className="mt-6 md:mt-0 md:col-span-1">
                    <h2 className="text-sm md:text-base font-bold text-neutral-900 mb-3">
                        프로그램 안내
                    </h2>

                    <div className="space-y-5 text-xs md:text-sm text-neutral-900">
                        <div>
                            <p className="font-semibold mb-1">
                                1부(13:00~) GOAT Final Day
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-neutral-800">
                                <li>
                                    팀 프로젝트 데모 시연 및 피칭 발표
                                </li>
                            </ul>
                        </div>

                        <div>
                            <p className="font-semibold mb-1">
                                2부(16:00~) Networking Session
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-neutral-800">
                                <li>오프닝 강연</li>
                                <li>GDGoC INHA 연간 활동 소개 및 커뮤니티 정리</li>
                                <li>기술 강연(Technical Talk) - 2세션</li>
                                <li>자유로운 네트워킹</li>
                            </ul>
                        </div>

                        <div>
                            <p className="font-semibold mb-1">
                                뒷풀이 (19:00~)
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. 지도 (찾아오는 길) */}
            {/* 4. 지도 (찾아오는 길) */}
            <section>
                <h2 className="text-sm md:text-base font-semibold text-neutral-900 mb-3">
                    찾아오는 길
                </h2>
                <HomecomingMap/>
            </section>
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

    return (<div
            className="rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100 h-[220px] md:h-[320px] lg:h-[420px]">
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