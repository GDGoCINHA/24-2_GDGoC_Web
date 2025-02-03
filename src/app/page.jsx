"use client";
import { useEffect, useRef } from 'react';
import { Button } from "@nextui-org/react";
import Image from "next/image";
import Lenis from '@studio-freight/lenis';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

import bg from "@public/src/images/bgimg.png"
import gdgocIcon from "@public/src/images/GDGoC_icon.png"

// GSAP ScrollTrigger 플러그인 등록
gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const leftArrowRef = useRef(null);
  const rightArrowRef = useRef(null);

  const buttonRef = useRef(null);
  const recruitTextRef = useRef(null);
  const logoRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.TypeHangul) {
      TypeHangul.type('#typing-effect', {
        text: '개발자와 비개발자가 함께 성장하는 즐거움',
        speed: 27,
        intervalType: 20,
        humanize: 0.3,
      });
      const typingEffect = document.getElementById('typing-effect');
      typingEffect.addEventListener('th.endType', () => {
        console.log('endType');
        gsap.fromTo(logoRef.current,
          {y:50, opacity:0},
          {y:0, opacity:1, duration:1, ease:"power1.inOut"}
        );

        gsap.fromTo(recruitTextRef.current,
          {y:50, opacity:0},
          {y:0, opacity:1, duration:1, ease:"power1.inOut"}
        );

        gsap.fromTo(buttonRef.current,
          {y:50, opacity:0},
          {y:0, opacity:1, duration:1, delay:0.4, ease:"power1.out", 
            onComplete: () => {
              gsap.to(buttonRef.current,{
                y: "-=10",
                duration: 1.5,
                repeat: -1,
                yoyo: true,
                ease: "power1.inOut"
              })
            }
          }
        );

        if (leftArrowRef.current && rightArrowRef.current) {
          // 왼쪽 화살표 설정
          gsap.set(leftArrowRef.current, { strokeDasharray: 1000, strokeDashoffset: 1000 });
          
          // 오른쪽 화살표 설정
          gsap.set(rightArrowRef.current, { strokeDasharray: 1000, strokeDashoffset: 1000 });
          
          // 왼쪽 화살표 애니메이션
          gsap.to(leftArrowRef.current, {
            strokeDashoffset: 0,
            duration: 5,
            ease: "power1.inOut"
          });
    
          // 오른쪽 화살표 애니메이션
          gsap.to(rightArrowRef.current, {
            strokeDashoffset: 0,
            duration: 2.5,
            ease: "power1.inOut"
          });
        }
      });
    }
  }, []);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.5,
      smoothWheel: true,
      wheelMultiplier: 0.8,
      smoothTouch: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // ScrollTrigger와 Lenis 연동
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    
    // Section2 전체를 pin하고 텍스트 애니메이션 설정
    ScrollTrigger.create({
      trigger: "#section2",
      start: "top top",  // section2가 화면 최상단에 왔을 때
      end: "+=100%",     // 스크롤을 100% 더 해야 pin이 해제됨
      pin: true,         // 섹션 고정
      markers: false     // 개발용 마커
    });

    gsap.to('#section2-text1', {
      scrollTrigger: {
        trigger: '#section2',
        start: 'top top',  // section2의 top이 화면의 top에 닿을 때 시작
        end: '+=33%',      // 전체 스크롤의 1/3 지점
        scrub: true,       
        markers: true,
      },
      opacity: 1,
      y: 0,
      duration: 1
    });

    gsap.to('#section2-text2', {
      scrollTrigger: {
        trigger: '#section2',
        start: 'center top',   // 첫 번째 텍스트가 끝나는 시점
        end: '+=66%',     // 두 번째 텍스트 애니메이션
        scrub: true,
        markers: true,
      },
      opacity: 1,
      y: 0,
      duration: 1
    });

    gsap.to('#section2-text3', {
      scrollTrigger: {
        trigger: '#section2',
        start: '+=23%',  // 두 번째 텍스트가 끝나는 시점
        end: '+=33%',   // 세 번째 텍스트가 끝날 때
        scrub: true,
        markers: false,
      },
      opacity: 1,
      y: 0,
      duration: 1
    });

    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  useEffect(() => {
    const setScreenHeight = () => {
      const height = window.innerHeight;
      document.getElementById('section2').style.height = `${height}px`;
    };

    setScreenHeight();
    window.addEventListener('resize', setScreenHeight);

    return () => window.removeEventListener('resize', setScreenHeight);
  }, []);

  return (
    <div className="flex flex-col w-screen">
      <div id="section1" className="flex flex-col h-screen w-full relative">
        <div className='absolute top-0 left-0flex flex-row select-none pt-[53px] px-[96px]'>
          <div className='flex flex-row gap-x-[16px] w-fit cursor-pointer'>
            <Image className='' src={gdgocIcon} alt='gdgocIcon' width={54} height={26} />
            <div className='text-white text-[16px] pt-[3px]'>
              <strong>GDGoC</strong> Inha univ.
            </div>
          </div>
        </div>
        <Image src={bg} alt="bg" fill className="absolute top-0 left-0 -z-10" />
        <div className='absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-black to-transparent'></div>
        <div className="flex flex-col w-full h-full items-center">
          <div id="typing-effect" className="text-white text-5xl font-bold min-h-[48px] mt-44">
          </div>
          <div className="font-['OCR_A'] text-4xl mt-4 flex opacity-0" ref={logoRef}>
            <span className="text-red-500 neon-text tracking-normal">G</span>
            <span className="text-green-500 neon-text tracking-normal">D</span>
            <span className="text-yellow-500 neon-text tracking-normal">G</span>
            <span className="text-blue-500 neon-text tracking-normal">O</span>
            <span className="text-red-500 neon-text tracking-normal">C</span>
            <span className="text-white ml-4">INHA</span>
          </div>
          <p className="text-white mt-32 text-[30px] font-semibold opacity-0" ref={recruitTextRef}>2025-1 Recruit</p>
          <div className="flex flex-row mt-[41px] w-full justify-center items-center opacity-0" ref={buttonRef}>
          <svg className="min-w-[90px]" width="51" height="31" viewBox="0 0 51 31" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              ref={leftArrowRef}
              d="M2.21611 2.34863C7.10778 14.0088 23.2195 33.429 48.534 17.8271M48.534 17.8271L36.0617 12.2884M48.534 17.8271L44.3587 29.278" 
              stroke="#BFBFBF" 
              strokeWidth="3" 
              strokeLinecap="round"
              style={{
                strokeDasharray: "1000",
                  strokeDashoffset: "1000"
              }}
            />
          </svg>

            <Button radius="full" className="w-60 mr-3 h-16 bg-gradient-to-r from-[#EA4335] to-[#FF6E62] text-white text-3xl">
              지원하기
            </Button>

            <svg width="90" className="" height="68" viewBox="0 0 90 68" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                ref={rightArrowRef}
                d="M88.4135 2.26674C75.4201 21.3307 44.7322 53.767 22.2678 35.276C6.92995 22.6517 24.6615 7.13738 40.9065 21.5997C57.1515 36.062 43.1315 70.5562 2.7082 57.2459M2.7082 57.2459L9.74433 52.2916M2.7082 57.2459L9.55602 66.445" 
                stroke="#BFBFBF" 
                strokeWidth="3" 
                strokeLinecap="round"
                style={{
                  strokeDasharray: "1000",
                  strokeDashoffset: "1000"
                }}
              />
            </svg>

          </div>
        </div>

      </div>
      <div id="section2" className="flex flex-col w-full bg-black relative">
        <div className="flex flex-col justify-center items-center w-full h-full">
          <div className="text-white text-5xl mt-44">
            <span className="font-['OCR_A']">
              <span className="text-red-500 neon-text-sm">G</span>
              <span className="text-green-500 neon-text-sm">D</span>
              <span className="text-yellow-500 neon-text-sm">G</span>
              <span className="text-blue-500 neon-text-sm">O</span>
              <span className="text-red-500 neon-text-sm">C</span>
              <span className="text-white ml-4 neon-text-sm">INHA</span>
            </span>
            , 어떤 곳인가요?
          </div>
          <div className="text-white space-y-4 font-semibold text-4xl flex flex-col items-center mt-20">
            <p id="section2-text1" className="opacity-0" ><span className="text-red-500">개발</span>에 관심 있는 사람들이 모여 <span className="text-green-500">네트워킹</span> 하고,</p>
            <p id="section2-text2" className="opacity-0">다양한 분야의 프로젝트에 참여하며 <span className="text-yellow-500">함께 성장</span>하는 공간입니다.</p>
            <br/>
            <p id="section2-text3" className="opacity-0">협업을 통해 폭넓은 경험을 쌓으며 <span className="text-blue-500">새로운 가능성</span>을 발견해보세요!</p>
          </div>
        </div>
      </div>
      <div id="section3" className="flex flex-col h-screen w-full border-1 border-white">
        <p>asdfasdfsadf</p>
      </div>
      <div id="section4" className="flex flex-col h-screen w-full border-1 border-white">
        <p>asdfasdfsadf</p>
      </div>
    </div>
  );
}
