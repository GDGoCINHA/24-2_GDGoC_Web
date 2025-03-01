import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import gsap from 'gsap';

import seminar from '@public/src/images/activity/seminar.jpg';
import snack from '@public/src/images/activity/snack.jpg';
import party from '@public/src/images/activity/party.jpg';
import conf from '@public/src/images/activity/conf.jpg';
import googleconf from '@public/src/images/activity/googleconf.jpg';
import christmas from '@public/src/images/activity/christmas.jpg';

function ActivitiesSection() {

    const [hoveredCard, setHoveredCard] = useState(1);

    const handleMouseEnter = (cardIndex) => {
        setHoveredCard(cardIndex);
    };

    const handleMouseLeave = () => {
        setHoveredCard(null);
    };

    const cards = [
        {title: '연사자 초청', description: '실전활용도 높은 온/오프 강연', image: seminar},
        {title: '간식드리미', description: '정성 가득 시험기간 간식드리미', image: snack},
        {title: '네트워킹 행사', description: 'MT/한강/잔망 등 다같이 외부 나들이', image: party},
        {title: '내부 행사', description: '자체•연합 해커톤 주최 및 참여', image: conf},
        {title: '외부행사', description: 'Google 등 IT기업의 네트워킹/레퍼런스 참여', image: googleconf},
        {title: '크리스마스 파티', description: '연말 파티와 함께하는 네트워킹', image: christmas},
    ]


    useEffect(() => {
        gsap.fromTo(
            '#cards',
            {
                y: 90,
                opacity: 0,
            },
            {
                y: 0,
                opacity: 1,
                duration: 1,
                delay: 0.5,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: '#section4',
                    start: 'top center',
                    toggleActions: 'play none none reverse',
                },
            }
        );
    }, []);


    return (
        <div id='section4' className='flex flex-col h-full w-full justify-center'>
            <div className='text-white text-[3.5vw] mobile:text-[6vw] mobile:mx-[20px] font-semibold mt-96 text-center'>
                <div className='text-[70px] mobile:text-[26vw]'>❓</div>
                <div className='text-[2.5vw] mobile:text-[4vw]'>합류하면 어떤 활동들을 할 수 있나요?</div>
            </div>
            <div id='cards' className='flex flex-col w-full h-full mt-36 mb-36 opacity-0'>
                <div className='grid grid-cols-3 mobile:grid-cols-2 gap-5 px-28 tablet:px-30 mobile:px-4'>
                    {cards.map((card, index) => (
                        <div
                        id='card'
                        key={index}
                        className='group relative w-full h-[300px] rounded-2xl overflow-hidden'
                        onMouseEnter={() => handleMouseEnter(index)}
                        onMouseLeave={handleMouseLeave}
                        >
                            <div className="w-full h-full relative">
                                <Image
                                    src={card.image}
                                    alt={card.title}
                                    fill
                                    className='w-auto h-auto object-cover transition-transform duration-300 group-hover:scale-110 z-0'
                                />
                                <div
                                    className={`absolute inset-0 bg-black/70 transition-opacity duration-300 flex items-center justify-center z-10
                                        ${hoveredCard === index ? 'opacity-100' : 'opacity-0'}`}
                                >
                                    <div className='text-white text-center p-6'>
                                        <h3 className='text-[2.5vw] font-bold mb-2 mobile:text-[4vw]'>{card.title}</h3>
                                        <p className='text-[1.5vw] mobile:text-[4vw]'>{card.description}</p>
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

export default ActivitiesSection;