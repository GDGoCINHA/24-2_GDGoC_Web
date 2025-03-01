import React, { useEffect } from 'react';
import Image from 'next/image';
import gsap from 'gsap';

import { Splide, SplideSlide } from '@splidejs/splide';
import { AutoScroll } from '@splidejs/splide-extension-auto-scroll';
import '@splidejs/splide/css';

import study1 from '@public/src/images/study/study1.jpg';
import study2 from '@public/src/images/study/study2.jpg';
import study3 from '@public/src/images/study/study3.jpg';
import study4 from '@public/src/images/study/study4.jpg';
import study5 from '@public/src/images/study/study5.jpg';

function StudySection() {

    const study = [
        {title: '백엔드 스터디', image: study1},
        {title: '인공지능 스터디', image: study2},
        {title: '파이썬 기초 스터디', image: study3},
        {title: '파이썬 데이터 분석 스터디', image: study4},
        {title: 'UX/UI 스터디', image: study5},
    ]

    useEffect(() => {
        const splide = new Splide('#card-carousel', {
            type: 'loop',
            drag: 'free',
            focus: 'center',
            perPage: 4,
            gap: '2rem',
            breakpoints: {
                1024: {
                    perPage: 3,
                    gap: '1.5rem',
                },
                768: {
                    perPage: 2,
                    gap: '1rem',
                },
                480: {
                    perPage: 1,
                    gap: '0.5rem',
                },
            },
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
        <div id="section5" className="flex flex-col h-full w-full justify-start items-center">
            <p className="text-white text-[2.5vw] mobile:text-[4vw] font-semibold text-center mt-56 mobile:mt-36 mb-20">이런 공부, 같이 해보실래요?</p>
            <div id="card-carousel" className="splide w-full max-w-[1800px] px-20 my-20 mobile:my-5 mobile:px-4">
                <div className="splide__track">
                    <div className="splide__list">
                        {study.map((item, index) => (
                            <div className="splide__slide" key={index}>
                                <div className="flex flex-col">
                                    <div className="relative aspect-[3/4] w-full">
                                        <Image 
                                            src={item.image} 
                                            alt={item.title} 
                                            className="object-contain rounded-lg"
                                            fill 
                                            sizes="(max-width: 480px) 90vw, 
                                                   (max-width: 768px) 90vw, 
                                                   (max-width: 1024px) 45vw, 
                                                   800px"
                                        />
                                    </div>
                                    <p className="text-white text-[1.5vw] mobile:text-[4vw] font-semibold mt-4 text-center">
                                        {item.title}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudySection;