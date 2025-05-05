"use client";

import React from 'react';
import Header from './Header';
import MainCarousel from './components/MainCarousel';
import CardCarousel from './components/CardCarousel';
import EventCard from './components/EventCard';
import FAQ from './components/FAQ';
import { mainSlides, ongoingEvents, ongoingStudies } from './data/events';
import eventbg from '@public/src/images/songdo_conf.jpg';
import eventposter from '@public/src/images/study/study1.jpg';

export default function Page() {
  // 이미지 임포트 문제 해결을 위한 실제 슬라이드 데이터
  const slidesWithImages = mainSlides.map(slide => ({
    ...slide,
    background: eventbg,
    poster: eventposter
  }));

  // 카드 아이템을 SplideSlide로 감싸는 함수
  const renderEventCards = (events) => {
    return events.map((event, index) => (
      <div className="splide__slide" key={index}>
        <EventCard 
          logo={event.logo}
          title={event.title}
          statusLabel={event.statusLabel}
          statusColor={event.statusColor}
          eventType={event.eventType}
          eventTypeColor={event.eventTypeColor}
          description={event.description}
          details={event.details}
          isHidden={event.isHidden}
        />
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-black mb-64">
      <Header />
      <div className="w-full flex flex-col justify-center">
        <MainCarousel slides={slidesWithImages} />
        
        <div className='flex flex-col max-w-[1300px] w-full mx-auto justify-start pt-[130px]'>
          <CardCarousel id="card-carousel-1" title="진행중인 행사">
            {renderEventCards(ongoingEvents)}
          </CardCarousel>
          
          <CardCarousel id="card-carousel-2" title="진행중인 스터디">
            {renderEventCards(ongoingStudies)}
          </CardCarousel>
          
          {/* FAQ 섹션 */}
          <FAQ />
        </div>
      </div>
    </div>
  );
}