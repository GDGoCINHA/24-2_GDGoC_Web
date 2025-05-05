import { useEffect, useRef } from 'react';
import { Splide } from '@splidejs/splide';
import '@splidejs/splide/css';

export default function CardCarousel({ id, title, children }) {
  const splideRef = useRef(null);

  useEffect(() => {
    if (splideRef.current) {
      const cardSplide = new Splide(splideRef.current, {
        type: 'slide',
        perPage: 3,
        gap: '3rem',
        arrows: true,
        pagination: false,
        drag: true,
        snap: true,
      });

      cardSplide.mount();

      return () => {
        cardSplide.destroy();
      };
    }
  }, []);

  return (
    <>
      <p className='text-white text-3xl font-bold mt-16 mb-10'>{title}</p>
      <div id={id} className="splide" ref={splideRef}>
        <div className="splide__track">
          <div className="splide__list">
            {children}
          </div>
        </div>
      </div>
    </>
  );
} 