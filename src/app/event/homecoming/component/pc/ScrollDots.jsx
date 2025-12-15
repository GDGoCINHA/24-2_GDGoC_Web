'use client'

export default function ScrollDots({count, activeIndex, onJump}) {
    return (<div className="pointer-events-auto absolute top-64 left-6 flex flex-col gap-4">
        {Array.from({length: count}).map((_, i) => (<button
            key={i}
            onClick={() => onJump?.(i)}
            className={`
            w-3 h-3 rounded-full transition-all duration-300
            ${i === activeIndex ? 'bg-white scale-125' : 'bg-white/30 hover:bg-white/60'}
          `}
            aria-label={`Go to section ${i + 1}`}
        />))}
    </div>);
}