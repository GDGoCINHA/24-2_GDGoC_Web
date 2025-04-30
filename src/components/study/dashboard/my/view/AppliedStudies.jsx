import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";

export default function AppliedStudies() {
    const router = useRouter();

    const data = {
        currentStudies: [
            {id: 1, title: "백엔드", date: "2024.09.09", status: "PENDING"}
        ],
        completedStudies: [
            {id: 2, title: "UI/UX", date: "2024.02.28", status: "APPROVED"},
            {id: 3, title: "프론트엔드", date: "2024.03.15", status: "REJECTED"}
        ],
    };

    const getStatusBadge = (status) => {
        const baseClasses = "px-3 py-1 rounded-full text-sm font-medium text-white";
        if (status === 'APPROVED')
            return `${baseClasses} bg-blue-500`;
        if (status === 'REJECTED')
            return `${baseClasses} bg-red-500`;
        return `${baseClasses} bg-yellow-500`;
    };

    const getStatusName = (status) => {
        if (status === 'APPROVED') return '합격';
        if (status === 'REJECTED') return '불합격';
        return '발표 전';
    };

    const renderTable = (title, data) => (
        <div className="mb-10">
            <h2 className="text-xl md:text-2xl font-bold mb-6">{title}</h2>

            <div className="overflow-x-auto">
                <div className="border border-gray-800 rounded-lg bg-gray-900">
                    <div className="grid grid-cols-4 py-4 px-4 bg-gray-800">
                        <div className="font-bold">스터디</div>
                        <div className="font-bold">모집 마감일</div>
                        <div className="font-bold text-center">상태</div>
                        <div></div>
                    </div>

                    {data.length > 0 ? (
                        data.map((data) => (
                            <div key={`${title}-${data.id}`} className="grid grid-cols-4 py-4 px-4 border-t border-gray-800 hover:bg-blue-900 transition-colors duration-200">
                                <div>{data.title}</div>
                                <div>{data.date}</div>
                                <div className="text-center">
                                    <span className={getStatusBadge(data.status)}>{getStatusName(data.status)}</span>
                                </div>
                                <div className="text-right">
                                    <button onClick={() => router.push(`/study/detail?title=${data.title}`)} className="text-blue-500 hover:text-blue-300 text-sm">정보 보기</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-8 px-4 text-center text-gray-500">
                            데이터가 없습니다.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <>
            {renderTable("모집 중인 스터디", data.currentStudies)}
            {renderTable("모집 완료된 스터디", data.completedStudies)}
        </>
    );
}