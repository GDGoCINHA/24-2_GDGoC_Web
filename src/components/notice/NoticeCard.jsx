'use client';

import Image from 'next/image';

export default function NoticeCard({ item, onClick }) {
    const statusDot = item.status === 'ongoing' ? 'bg-green-500' : 'bg-red-500';

    return (
        <button
            onClick={() => onClick?.(item)}
            className="text-left bg-[#1f1f1f] rounded-2xl overflow-hidden hover:shadow-lg transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
            <div className="relative aspect-video w-full bg-[#2a2a2a]">
                {item.image && (
                    <Image src={item.image} alt={item.title} fill className="object-cover" />
                )}
            </div>
            <div className="p-4 flex flex-col gap-y-2">
                <h3 className="text-white font-bold text-lg line-clamp-2">{item.title}</h3>
                <p className="text-gray-300 text-sm line-clamp-1">{item.summary}</p>
                <div className="flex items-center justify-between mt-2">
                    <div className="flex gap-2">
                        {item.tags?.map((t) => (
                            <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-[#2b2b2b] text-gray-200">#{t}</span>
                        ))}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-200">
                        <span className={`inline-block w-2 h-2 rounded-full ${statusDot}`} />
                        <span>{item.status === 'ongoing' ? '진행중' : '종료'}</span>
                    </div>
                </div>
            </div>
        </button>
    );
}


