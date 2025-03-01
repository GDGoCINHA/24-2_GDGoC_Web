import React, { useEffect } from 'react';
import gsap from 'gsap';


function StatsSection() {

    const stats = [
        { title: '전세계' , number: 1863, unit: '+', color: 'red' },
        { title: '참여국가' , number: 111, unit: '개국', color: 'green' },
        { title: '국내' , number: 36, unit: '대학', color: 'yellow' },
        { title: '현재 멤버' , number: 102, unit: '명', color: 'blue' },
    ];

    useEffect(() => {
        const numberElements = gsap.utils.toArray('.number-animation');
        
        numberElements.forEach((element, index) => {
            gsap.set(element, { textContent: '0' });
            gsap.to(element, {
                textContent: stats[index].number,
                duration: 0.8,
                ease: 'power1.out',
                snap: { textContent: 1 },
                scrollTrigger: {
                trigger: '#section3',
                start: 'top 80%',
                toggleActions: 'play none none reverse',
                },
            });
        });
    }, []);

    return (
        <div id='section3' className='flex flex-wrap justify-center items-start h-full w-full mt-[200vh] px-20 gap-x-20 gap-y-12 mobile:flex-col mobile:items-center' >
            {stats.map((stat, index) => (
                <div className='flex flex-col items-center justify-center flex-1' key={index}>
                    <p className={`text-${stat.color}-500 text-[2.5vw] font-semibold mb-4 mobile:text-[7vw]`}>{stat.title}</p>
                    <div className='flex flex-row'>
                        <p className='text-white text-[5vw] number-animation text-right mobile:text-[10vw]'>{stat.number}</p>
                        <p className='text-white text-[5vw] flex-none mobile:text-[10vw]'>{stat.unit}</p>
                    </div>
                </div>
            ))} 
        </div>  
    );
}

export default StatsSection;