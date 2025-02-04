"use client";
import { useEffect, useRef, useState } from 'react';
import { Button, Image } from "@nextui-org/react";
import NextImage from "next/image";
import Lenis from '@studio-freight/lenis';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { Splide, SplideSlide } from '@splidejs/splide';
import { AutoScroll } from '@splidejs/splide-extension-auto-scroll';
import '@splidejs/splide/css';

import bg from "@public/src/images/bgimg.png"
import gdgocIcon from "@public/src/images/GDGoC_icon.png"
import card1 from "@public/src/images/activity/seminar.jpg"
import card2 from "@public/src/images/activity/snack.jpg"
import card3 from "@public/src/images/activity/halloween.jpg"
import card4 from "@public/src/images/activity/hangang.jpg"
import card5 from "@public/src/images/activity/devfest.jpg"
import card6 from "@public/src/images/activity/christmas.jpg"

import study1 from "@public/src/images/study/notion.png"
import study2 from "@public/src/images/study/github.png"
import study3 from "@public/src/images/study/figma.png"

import gdg from "@public/src/images/logo/gdg.png"
import gpters from "@public/src/images/logo/gpters.png"
import inha from "@public/src/images/logo/inha.png"
import link from "@public/src/images/logo/link.png"
import kang from "@public/src/images/logo/강쌤과외.png"
import dongyeon from "@public/src/images/logo/동연.png"
import chajidan from "@public/src/images/logo/창지단.png"

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
      lenis.raf(time * 800);
    });

    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#section2",
        start: "top top",
        end: "+=200%",
        scrub: true,
        pin: true,
        markers: false,
      }
    });
    
    // 네온 깜빡임 효과를 위한 텍스트 요소들 선택
    const neonLetters = document.querySelectorAll('#section2 .neon-text-sm');
    
    // 각 글자에 대한 네온 깜빡임 효과 추가
    neonLetters.forEach((letter, index) => {
      tl.to(letter, {
        textShadow: "0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor",
        duration: 0.5, // 지속시간 증가
        yoyo: true,
        repeat: 1, // 반복 횟수 증가
      }, 0.2 + index * 0.3); // 각 글자 사이의 딜레이도 증가
    });
    
    // 기존 텍스트 애니메이션
    tl.fromTo("#section2-text1", { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, 0.20)
      .fromTo("#section2-text2", { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, 0.70)
      .fromTo("#section2-text3", { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, 1.20)
      .fromTo("#section2-text4", { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, 1.70);
    


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

  useEffect(() => {
    // section3 숫자 애니메이션
    const numberElements = gsap.utils.toArray('.number-animation');
    
    numberElements.forEach(element => {
      const targetNumber = parseInt(element.textContent);
      gsap.set(element, { textContent: '0' });
      
      gsap.to(element, {
        textContent: targetNumber,
        duration: 0.8,
        ease: "power1.out",
        snap: { textContent: 1 },
        scrollTrigger: {
          trigger: "#section3",
          start: "top 80%",
          toggleActions: "play none none reverse"
        },
      });
    });

    // section4 카드 애니메이션 추가
    gsap.fromTo("#cards", 
      {
        y: 100,
        opacity: 0
      },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        delay: 0.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: "#section4", 
          start: "top center",
          toggleActions: "play none none reverse"
        }
      }
    );

    gsap.fromTo("#logos", 
      {
        y: 50,
        opacity: 0
      },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        delay: 0.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: "#section6", 
          start: "top center",
          toggleActions: "play none none reverse"
        }
      }
    );

  }, []);

  useEffect(() => {
    const splide = new Splide('#card-carousel', {
      type: 'loop',
      drag: 'free',
      focus: 'center',
      perPage: 4,
      autoScroll: {
        speed: 1.5,
      },
      arrows: false,
      pagination: false,
    });

    splide.mount({ AutoScroll });

    return () => {
      splide.destroy();
    };
  }, []);

  return (
    <div className="flex flex-col w-screen">
      <div id="section1" className="flex flex-col h-screen w-full relative">
        <div className='absolute top-0 left-0flex flex-row select-none pt-[53px] px-[96px]'>
          <div className='flex flex-row gap-x-[16px] w-fit cursor-pointer'>
            <NextImage className='' src={gdgocIcon} alt='gdgocIcon' width={54} height={26} />
            <div className='text-white text-[16px] pt-[3px]'>
              <strong>GDGoC</strong> Inha univ.
            </div>
          </div>
        </div>
        <NextImage src={bg} alt="bg" fill className="absolute top-0 left-0 -z-10 object-cover" />
        <div className='absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-black to-transparent'></div>
        <div className="flex flex-col w-full h-full items-center">
          <div id="typing-effect" className="text-white text-5xl font-bold min-h-[48px] mt-60">
          </div>
          <div className="font-['OCR_A'] text-4xl mt-4 flex opacity-0" ref={logoRef}>
            <span className="text-red-500 neon-text tracking-normal">G</span>
            <span className="text-green-500 neon-text tracking-normal">D</span>
            <span className="text-yellow-500 neon-text tracking-normal">G</span>
            <span className="text-blue-500 neon-text tracking-normal">o</span>
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
      <div id="section2" className="flex flex-col w-full h-screen bg-black relative">
        <div className="flex flex-col items-center w-full h-full">
          <div className="text-white text-6xl mt-60">
            <span className="font-['OCR_A']">
              <span className="text-red-500 neon-text-sm">G</span>
              <span className="text-green-500 neon-text-sm">D</span>
              <span className="text-yellow-500 neon-text-sm">G</span>
              <span className="text-blue-500 neon-text-sm">o</span>
              <span className="text-red-500 neon-text-sm">C</span>
              <span className="text-white ml-4 neon-text-sm">INHA</span>
            </span>
            , 어떤 곳인가요?
          </div>
          <div className="text-white space-y-4 font-semibold text-4xl flex flex-col items-center mt-28 gap-y-4">
            <p id="section2-text1" className="opacity-0" ><span className="text-red-500">개발</span>에 관심 있는 사람들이 모여 <span className="text-green-500">네트워킹</span> 하고,</p>
            <p id="section2-text2" className="opacity-0">다양한 프로젝트에 참여하며 <span className="text-yellow-500">함께 성장</span>하는 공간입니다.</p>
            <p id="section2-text3" className="opacity-0">비개발자부터 숙련된 개발자까지 누구나 <span className="text-blue-500">함께</span>할 수 있습니다.</p>
            <p id="section2-text4" className="opacity-0">GDGoC라는 글로벌 IT 무대에서 끊임없이 기회를 찾고 <span className="text-red-500">성장</span>해보세요!</p>
            
          </div>
        </div>
      </div>
      <div id="section3" className="flex flex-row justify-between items-start h-full w-full mt-[200vh] px-20">
        <div className="flex flex-col items-center justify-center">
          <p className="text-red-500 text-4xl font-semibold mb-4">전세계</p>
          <div className="flex flex-row">
            <p className="text-white text-8xl number-animation text-right min-w-[220px]">1863</p>
            <p className="text-white text-8xl">+</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center">
          <p className="text-green-500 text-4xl font-semibold mb-4">참여국가</p>
          <div className="flex flex-row">
            <p className="text-white text-8xl number-animation text-right min-w-[160px]">111</p>
            <p className="text-white text-8xl">개국</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center">
          <p className="text-yellow-500 text-4xl font-semibold mb-4">국내</p>
          <div className="flex flex-row">
            <p className="text-white text-8xl number-animation text-right min-w-[130px]">36</p>
            <p className="text-white text-8xl">대학</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center">
          <p className="text-blue-500 text-4xl font-semibold mb-4">현재 멤버</p>
          <div className="flex flex-row">
            <p className="text-white text-8xl number-animation text-right min-w-[160px]">102</p>
            <p className="text-white text-8xl">명</p>
          </div>
        </div>
      </div>
      <div id="section4" className="flex flex-col h-full w-full justify-center">
        <p className="text-white text-6xl font-semibold mt-96 text-center">합류하면 어떤 활동들을 할 수 있나요?</p>
        <div id="cards" className="flex flex-col w-full h-full mt-36 mb-36 opacity-0">
          <div className="flex flex-row w-full justify-between px-28">
            <div id="card" className="group relative w-[500px] h-[300px] rounded-2xl overflow-hidden">
              <Image 
                isBlurred 
                src={card1.src} 
                alt="card1" 
                width={500} 
                height={300} 
                as={NextImage} 
                className="object-cover transition-transform duration-300 group-hover:scale-110 z-0"
              />
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
                <div className="text-white text-center p-6">
                  <h3 className="text-2xl font-bold mb-2">연사자 초청</h3>
                  <p className="text-lg">다양한 주제를 가지고 연사자를 초청하여 세미나를 진행합니다.</p>
                </div>
              </div>
            </div>
            <div id="card" className="group relative w-[500px] h-[300px] rounded-2xl overflow-hidden">
              <Image 
                isBlurred 
                src={card2.src} 
                alt="card2" 
                width={500} 
                height={300} 
                as={NextImage} 
                className="object-cover transition-transform duration-300 group-hover:scale-110 z-0"
              />
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
                <div className="text-white text-center p-6">
                  <h3 className="text-2xl font-bold mb-2">간식드리미</h3>
                  <p className="text-lg">시험기간 고생하는 학우들을 위해 진행된 간식드리미</p>
                </div>
              </div>
            </div>
            <div id="card" className="group relative w-[500px] h-[300px] rounded-2xl overflow-hidden">
              <Image 
                isBlurred 
                src={card3.src} 
                alt="card3" 
                width={500} 
                height={300} 
                as={NextImage} 
                className="object-cover transition-transform duration-300 group-hover:scale-110 z-0"
              />
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
                <div className="text-white text-center p-6">
                  <h3 className="text-2xl font-bold mb-2">할로윈 파티</h3>
                  <p className="text-lg">할로윈 파티를 통해 네트워킹을 진행합니다.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-row w-full justify-between px-28 mt-16">
            <div id="card" className="group relative w-[500px] h-[300px] rounded-2xl overflow-hidden">
              <Image 
                isBlurred 
                src={card4.src} 
                alt="card4" 
                width={500} 
                height={300} 
                as={NextImage} 
                className="object-cover transition-transform duration-300 group-hover:scale-110 z-0"
              />
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
                <div className="text-white text-center p-6">
                  <h3 className="text-2xl font-bold mb-2">한강 피크닉</h3>
                  <p className="text-lg">야외에서 진행되는 친목 도모 활동</p>
                </div>
              </div>
            </div>
            <div id="card" className="group relative w-[500px] h-[300px] rounded-2xl overflow-hidden">
              <Image 
                isBlurred 
                src={card5.src} 
                alt="card5" 
                width={500} 
                height={300} 
                as={NextImage} 
                className="object-cover transition-transform duration-300 group-hover:scale-110 z-0"
              />
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
                <div className="text-white text-center p-6">
                  <h3 className="text-2xl font-bold mb-2">DevFest</h3>
                  <p className="text-lg">Google 개발자 컨퍼런스 단체 참여</p>
                </div>
              </div>
            </div>
            <div id="card" className="group relative w-[500px] h-[300px] rounded-2xl overflow-hidden">
              <Image 
                isBlurred 
                src={card6.src} 
                alt="card6" 
                width={500} 
                height={300} 
                as={NextImage} 
                className="object-cover transition-transform duration-300 group-hover:scale-110 z-0"
              />
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
                <div className="text-white text-center p-6">
                  <h3 className="text-2xl font-bold mb-2">크리스마스 파티</h3>
                  <p className="text-lg">연말 파티와 함께하는 네트워킹</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="section5" className="flex flex-col h-screen w-full justify-start items-center">
        <p className="text-white text-6xl font-semibold text-center mt-56 mb-20">이런 공부, 같이 해보실래요?</p>
        
        <div id="card-carousel" className="splide w-full px-20 mt-20">
          <div className="splide__track">
            <div className="splide__list">
              <div className="splide__slide" >
                <div className="w-[300px] h-[400px] rounded-2xl">
                  <NextImage src={study1} alt="card1" className="w-full h-full" width={300} height={400} />
                </div>
                <p className="text-white text-2xl font-semibold mt-4">Notion 특강</p>
              </div>
              <div className="splide__slide" >
                <div className="w-[300px] h-[400px] rounded-2xl">
                  <NextImage src={study2} alt="card1" className="w-full h-full" width={300} height={400} />
                </div>
                <p className="text-white text-2xl font-semibold mt-4">Github 특강</p>
              </div>
              <div className="splide__slide" >
                <div className="w-[300px] h-[400px] rounded-2xl">
                  <NextImage src={study3} alt="card1" className="w-full h-full" width={300} height={400} />
                </div>
                <p className="text-white text-2xl font-semibold mt-4">Figma 특강</p>
              </div>
              <div className="splide__slide" >
                <div className="w-[300px] h-[400px] rounded-2xl">
                  <NextImage src={study1} alt="card1" className="w-full h-full" width={300} height={400} />
                </div>
                <p className="text-white text-2xl font-semibold mt-4">Notion 특강</p>
              </div>
              <div className="splide__slide" >
                <div className="w-[300px] h-[400px] rounded-2xl">
                  <NextImage src={study2} alt="card1" className="w-full h-full" width={300} height={400} />
                </div>
                <p className="text-white text-2xl font-semibold mt-4">Github 특강</p>
              </div>
              <div className="splide__slide" >
                <div className="w-[300px] h-[400px] rounded-2xl">
                  <NextImage src={study3} alt="card1" className="w-full h-full" width={300} height={400} />
                </div>
                <p className="text-white text-2xl font-semibold mt-4">Figma 특강</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="section6" className="flex flex-col h-full w-full justify-start items-center">
        <div id="logos">
          <div className="text-white text-6xl mt-60 w-full text-center">
            <span className="font-['OCR_A']">
              <span className="text-red-500">G</span>
              <span className="text-green-500">D</span>
              <span className="text-yellow-500">G</span>
              <span className="text-blue-500">o</span>
              <span className="text-red-500">C</span>
              <span className="text-white ml-4">INHA</span>
            </span>
            와 함께하는 단체
          </div>
          <div className="flex flex-row w-full justify-center items-center mt-40 gap-x-32">
            <div className="flex flex-col items-center justify-center">
              <NextImage src={gdg} alt="gdg" width={200} height={200} className="h-[200px] object-contain" />
              <p className="text-white text-2xl font-semibold mt-4">GDG Korea</p>
            </div>
            <div className="flex flex-col items-center justify-center">
              <NextImage src={gpters} alt="gpters" width={200} height={200} className="h-[200px] object-contain" />
              <p className="text-white text-2xl font-semibold mt-4">GPTERS</p>
            </div>
            <div className="flex flex-col items-center justify-center">
              <NextImage src={kang} alt="kang" width={200} height={200} className="h-[200px] object-contain" />
              <p className="text-white text-2xl font-semibold mt-4">강쌤과외</p>
            </div>
            
          </div>
          <div className="flex flex-row w-full justify-center items-center mt-20 gap-x-32 mb-32">
            <div className="flex flex-col items-center justify-center">
              <NextImage src={link} alt="link" width={200} height={200} className="h-[200px] object-contain" />
              <p className="text-white text-2xl font-semibold mt-4">LINK3.0 사업단</p>
            </div>
            <div className="flex flex-col items-center justify-center">
              <NextImage src={inha} alt="inha" width={200} height={200} className="h-[200px] object-contain" />
              <p className="text-white text-2xl font-semibold mt-4">SW중심대학사업단</p>
            </div>
            
            <div className="flex flex-col items-center justify-center">
              <NextImage src={dongyeon} alt="dongyeon" width={200} height={200} className="h-[200px] object-contain" />
              <p className="text-white text-2xl font-semibold mt-4">인하대학교 동아리연합회</p>
            </div>
            <div className="flex flex-col items-center justify-center">
              <NextImage src={chajidan} alt="chajidan" width={200} height={200} className="h-[200px] object-contain" />
              <p className="text-white text-2xl font-semibold mt-4">인하대학교 창업지원단</p>
            </div>
          </div>
        </div>
      </div>
      <div id="section7" className="flex flex-col h-full w-full justify-start items-center">
        <p className="text-white text-6xl font-semibold mt-56">GDGoC와 함께 변화된 나를 마주하세요</p>
        <div className="flex flex-row mt-32 mb-96 w-full justify-center items-center">
          <svg className="min-w-[90px]" width="51" height="31" viewBox="0 0 51 31" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M2.21611 2.34863C7.10778 14.0088 23.2195 33.429 48.534 17.8271M48.534 17.8271L36.0617 12.2884M48.534 17.8271L44.3587 29.278" 
              stroke="#BFBFBF" 
              strokeWidth="3" 
              strokeLinecap="round"
            />
          </svg>

            <Button radius="full" className="w-60 mr-3 h-16 bg-gradient-to-r from-[#EA4335] to-[#FF6E62] text-white text-3xl">
              지원하기
            </Button>

            <svg width="90" className="" height="68" viewBox="0 0 90 68" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M88.4135 2.26674C75.4201 21.3307 44.7322 53.767 22.2678 35.276C6.92995 22.6517 24.6615 7.13738 40.9065 21.5997C57.1515 36.062 43.1315 70.5562 2.7082 57.2459M2.7082 57.2459L9.74433 52.2916M2.7082 57.2459L9.55602 66.445" 
                stroke="#BFBFBF" 
                strokeWidth="3" 
                strokeLinecap="round"
              />
            </svg>

          </div>
      </div>
    </div>
  );
}
