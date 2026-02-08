'use client';

export default function FrameSection({ children }) {
    return (
        <section className="h-full w-full snap-start justify-center text-white">
            {children}
        </section>
    );
}