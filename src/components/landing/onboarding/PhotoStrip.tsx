import Image from 'next/image'

import { LANDING_PHOTO_STRIP } from '@/constant/landingContent'

/**
 * 핸드오프에서는 화면 폭을 꽉 채우는 띠였는데, 다른 섹션이 모두 1120px 컨테이너라
 * 이 구간만 양끝에 붙어 어긋나 보였다. 같은 폭으로 맞추고 카드 세 장으로 띄웠다.
 */
export default function PhotoStrip() {
  return (
    <section aria-label="활동 사진" className="border-t border-t-dusk-line-soft">
      <div className="mx-auto max-w-[1120px] px-[clamp(20px,5vw,44px)] py-[clamp(40px,5vw,72px)]">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-3">
          {LANDING_PHOTO_STRIP.map((photo) => (
            <figure
              key={photo.src}
              className="group relative m-0 overflow-hidden rounded-lg bg-dusk-slot"
            >
              <div className="relative h-[clamp(200px,20vw,280px)] w-full">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  loading="lazy"
                  sizes="(max-width: 47.9375rem) 100vw, 360px"
                  className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(.22,.61,.36,1)] group-hover:scale-105"
                  style={{ objectPosition: `50% ${photo.focusY}%`, filter: 'saturate(0.82)' }}
                />
              </div>
              <figcaption
                className="absolute inset-x-0 bottom-0 px-[18px] py-4 text-[13px] text-dusk-ink-100"
                style={{
                  background: 'linear-gradient(0deg, rgba(23,19,28,0.84), rgba(23,19,28,0))'
                }}
              >
                {photo.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
