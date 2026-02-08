'use client';

import { useMemo, useState } from 'react';
import NoticeCard from '@/components/notice/NoticeCard';
import NoticeModal from '@/components/notice/NoticeModal';
import { notices, NOTICE_CATEGORIES, NOTICE_STATUSES } from '@/mock/notices';

export default function NoticePage() {
    const [category, setCategory] = useState('all');
    const [status, setStatus] = useState('all');
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(false);

    const filtered = useMemo(() => {
        return notices.filter((n) => {
            const categoryOk = category === 'all' || n.category === category;
            const statusOk = status === 'all' || n.status === status;
            return categoryOk && statusOk;
        });
    }, [category, status]);

    if (!loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-white">
                <h2 className="text-2xl font-bold mb-2">Error</h2>
            </div>
        );
    }

    return (
        <div className="px-6 tablet:px-10 desktop:px-16 py-10">
            {/* Hero */}
            <div className="max-w-screen-xl mx-auto text-white">
                <h1 className="text-3xl font-extrabold">GDGoC INHA에서 진행중인 프로젝트 둘러보기</h1>
                <p className="text-gray-300 mt-2">개발자 커뮤니티의 공지, 행사, 프로젝트 소식을 확인하세요.</p>
            </div>

            {/* Filter Bar */}
            <div className="sticky top-0 z-10 mt-6 bg-[#0f0f0f]/80 backdrop-blur supports-[backdrop-filter]:bg-[#0f0f0f]/60 border-b border-white/5">
                <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-4 py-3 px-1">
                    <div className="flex gap-2 overflow-x-auto">
                        {NOTICE_CATEGORIES.map((c) => (
                            <button
                                key={c.key}
                                onClick={() => setCategory(c.key)}
                                className={`px-4 h-9 rounded-full whitespace-nowrap text-sm font-medium ${category === c.key ? 'bg-white text-black' : 'bg-[#1e1e1e] text-gray-200 hover:bg-[#2a2a2a]'}`}
                            >
                                {c.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2 items-center">
                        {NOTICE_STATUSES.map((s) => (
                            <button
                                key={s.key}
                                onClick={() => setStatus(s.key)}
                                className={`px-3 h-9 rounded-full text-sm font-medium flex items-center gap-2 ${status === s.key ? 'bg-white text-black' : 'bg-[#1e1e1e] text-gray-200 hover:bg-[#2a2a2a]'}`}
                            >
                                {s.key !== 'all' && (
                                    <span className={`w-2 h-2 rounded-full ${s.key === 'ongoing' ? 'bg-green-500' : 'bg-red-500'}`} />
                                )}
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-screen-xl mx-auto mt-8 grid gap-6 grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3">
                {filtered.map((item) => (
                    <NoticeCard key={item.id} item={item} onClick={setSelected} />
                ))}
            </div>

            <NoticeModal item={selected} onClose={() => setSelected(null)} />
        </div>
    );
}


