import Image from 'next/image'

import { LANDING_PHOTO_STRIP } from '@/constant/landingContent'

/** 괘선은 부모 배경색을 gap 1px 사이로 비쳐 보이게 해서 만든다. */
export default function PhotoStrip() {
  return (
    <section aria-label="활동 사진" className="border-t border-t-dusk-line-soft">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-px bg-[rgba(240,234,228,0.09)]">
        {LANDING_PHOTO_STRIP.map((photo) => (
          <figure key={photo.src} className="group relative m-0 overflow-hidden bg-dusk-slot">
            <div className="relative h-[clamp(220px,26vw,340px)] w-full">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                loading="lazy"
                sizes="(max-width: 47.9375rem) 100vw, 33vw"
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
    </section>
  )
}
