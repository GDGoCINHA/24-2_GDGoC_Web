import React, { useEffect } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function AboutSection() {
    useEffect(() => {
        const ctx = gsap.context(() => {
            // 섹션2 스크롤 애니메이션 타임라인 설정
            let tl = gsap.timeline({
                scrollTrigger: {
                    trigger: '#section2', // 트리거 요소
                    start: 'top top', // 시작 지점
                    end: '+=200%', // 종료 지점 (200% 스크롤)
                    scrub: true, // 스크롤에 따른 부드러운 애니메이션
                    pin: true, // 섹션 고정
                },
            });
        
            // GDGOC 네온 텍스트 깜빡임 효과
            const neonLetters = document.querySelectorAll('#section2 .neon1');
        
            // 첫 번째 깜빡임 효과
            tl.to(
              neonLetters,
              {
                textShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor',
                duration: 0.1,
                yoyo: true,
                repeat: 3,
                ease: 'steps(2)',
                stagger: {
                  each: 0.05,
                  from: 'random',
                },
              },
              0
            );
        
            // 두 번째 깜빡임 효과
            tl.to(
              neonLetters,
              {
                textShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor',
                duration: 0.15,
                yoyo: true,
                repeat: 2,
                ease: 'steps(1)',
                stagger: {
                  each: 0.03,
                  from: 'random',
                },
              },
              0.5
            );
        
            // 텍스트 페이드인 애니메이션
            tl.fromTo('#section2-text1', { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, 0.2) // 첫 번째 텍스트
              .fromTo('#section2-text2', { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, 0.7) // 두 번째 텍스트
              .fromTo('#section2-text3', { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, 1.2) // 세 번째 텍스트
              .fromTo('#section2-text4', { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, 1.7); // 네 번째 텍스트
        
            // 컴포넌트 언마운트 시 정리
            return () => {
              ScrollTrigger.getAll().forEach((trigger) => trigger.kill()); // 모든 ScrollTrigger 제거
            };
        });

        return () => {
            ctx.revert();
            ScrollTrigger.getAll().forEach(st => st.kill());
            gsap.killTweensOf("*");  // 모든 애니메이션 정리
        };
    }, []);

    return (
        <div id='section2' className='flex flex-col w-full h-screen bg-black relative'>
            <div className='flex flex-col items-center w-full h-full'>
            <div className='text-white/90 text-[3.5vw] font-semibold mobile:text-[5vw] mt-40 mobile:mt-24 mobile:mx-[30px]'>
                <span className='font-ocra font-normal mobile:text-3xl'>
                <span className='text-red-500 neon1 neon-text-sm'>G</span>
                <span className='text-green-500 neon1 neon-text-sm'>D</span>
                <span className='text-yellow-500 neon1 neon-text-sm'>G</span>
                <span className='text-blue-500 neon1 neon-text-sm'>o</span>
                <span className='text-red-500 neon1 neon-text-sm'>C</span>
                <span className='text-white ml-2 neon-text-sm'>INHA</span>
                </span>
                , 어떤 곳인가요?
            </div>
            <div className='text-white space-y-4 font-semibold text-[2.5vw] mobile:text-xl flex flex-col items-center mt-20 gap-y-4 text-center'>
                <p id='section2-text1' className='opacity-0'>
                <span className='text-red-500'>개발</span>에 관심 있는 사람들이 모여{' '}
                <br className='hidden mobile:inline' />
                <span className='text-green-500'>네트워킹</span> 하고,
                </p>
                <p id='section2-text2' className='opacity-0'>
                다양한 프로젝트에 참여하며 <br className='hidden mobile:inline' />
                <span className='text-yellow-500'>함께 성장</span>하는 공간입니다.
                </p>
                <p id='section2-text3' className='opacity-0'>
                비개발자부터 숙련된 개발자까지 <br className='hidden mobile:inline' />
                누구나 <span className='text-blue-500'>함께</span>할 수 있습니다.
                </p>
                <p id='section2-text4' className='opacity-0'>
                GDGoC라는 글로벌 IT 무대에서 <br className='hidden mobile:inline' />
                끊임없이 기회를 찾고 <span className='text-red-500'>성장</span>해보세요!
                </p>
            </div>
            </div>
        </div>
    );
}