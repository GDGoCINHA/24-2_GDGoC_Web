'use client';

export default function FrameSection({ children }) {
    return (
        <section className="h-full w-full snap-start flex items-center justify-center">
            {children}
        </section>
    );
}