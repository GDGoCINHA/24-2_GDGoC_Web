import React, { useEffect } from 'react';
import Image from 'next/image';
import gsap from 'gsap';

import gdg from '@public/src/images/logo/gdg.png';
import gpters from '@public/src/images/logo/gpters.png';
import inha from '@public/src/images/logo/inha.png';
import kang from '@public/src/images/logo/강쌤과외.png';
import dongyeon from '@public/src/images/logo/동연.png';
import chajidan from '@public/src/images/logo/창지단.png';

function PartnersSection() {

    useEffect(() => {
        gsap.fromTo(
            '#logos',
            {
                y: 90,
                opacity: 0,
            },
            {
                y: 0,
                opacity: 1,
                duration: 0.7,
                delay: 0.3,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: '#section6',
                    start: 'top center',
                    toggleActions: 'play none none reverse',
                },
            }
        );
    }, []);

    const partners = [
        {name: 'GDG Korea', image: gdg},
        {name: 'GPTERS', image: gpters},
        {name: '강쌤과외', image: kang},
        {name: 'SW중심대학사업단', image: inha},
        {name: '동아리연합회', image: dongyeon},
        {name: '창업지원단', image: chajidan},
    ]


    return (
        <div id='section6' className='flex flex-col h-full w-full justify-start items-center'>
            <div id='logos' className='w-full'>
                <div className='text-white text-[3.5vw] mobile:text-2xl mt-60 mobile:mt-24 w-full text-center'>
                    <span className='font-ocra font-extrabold'>
                        <span className='text-red-500'>G</span>
                        <span className='text-green-500'>D</span>
                        <span className='text-yellow-500'>G</span>
                        <span className='text-blue-500'>o</span>
                        <span className='text-red-500'>C</span>
                        <span className='text-white ml-2'>INHA</span>
                    </span>
                    와 함께하는 단체
                </div>
                <div className='grid grid-cols-3 gap-5 w-full mt-20 mb-20 px-40 justify-between mobile:px-10'>
                    {partners.map((partner, index) => (
                        <div className='flex flex-col items-center justify-center' key={index}>
                            <Image
                                src={partner.image}
                                alt={partner.name}
                                width={200}
                                height={200}
                                className='h-[20vh] mobile:h-[10vh] object-contain'
                            />
                            <p className='text-white text-[2vw] mobile:text-[3.5vw] font-semibold mt-4'>{partner.name}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default PartnersSection;