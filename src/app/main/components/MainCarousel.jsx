import { useEffect, useRef } from 'react';
import { Splide } from '@splidejs/splide';
import '@splidejs/splide/css';
import Image from 'next/image';
import Link from 'next/link';

export default function MainCarousel({ slides }) {
    const splideRef = useRef(null);

    useEffect(() => {
        if (splideRef.current) {
        const mainSplide = new Splide(splideRef.current, {
            type: 'loop',
            perPage: 1,
            autoplay: true,
            interval: 5000, // 5초
            pauseOnHover: false,
            arrows: false,
            pagination: true,
        });

        mainSplide.mount();

        return () => {
            mainSplide.destroy();
        };
        }
    }, []);

    return (
        <div id="main-carousel" className="splide" ref={splideRef}>
        <div className="splide__track">
            <div className="splide__list">
            {slides.map((slide, index) => (
                <div className="splide__slide" key={index}>
                <div className="h-[616px] flex items-center justify-center rounded-lg relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/50">
                    <Image className='w-full h-full object-cover blur-lg opacity-50' src={slide.background} alt='event background' />
                    </div>
                    <div className="z-10 flex flex-row w-full h-full">
                    <div className='flex justify-center items-center w-1/2'>
                        <Image src={slide.poster} width={375} height={500} alt='event poster' />
                    </div>
                    <div className='flex justify-center items-start w-1/2 flex-col'>
                        <div className="justify-start items-start flex flex-col gap-y-5">
                        <div className='flex flex-row gap-x-5'>
                            <div className='border-3 border-[#E94335] rounded-3xl px-9 py-1 text-[#E94335] font-bold text-xl'>
                            {slide.tag1}
                            </div>
                            <div className='border-3 border-[#34A853] rounded-3xl px-9 py-1 text-[#34A853] font-bold text-xl'>
                            {slide.tag2}
                            </div>
                        </div>
                        <p className='text-white text-xl font-bold'>{slide.title}</p>
                        <p className='text-white text-base'>{slide.description}</p>
                        <Link href={slide.link} className='text-white text-base underline'>더 알아보기</Link>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
            ))}
            </div>
        </div>
        </div>
    );
} 