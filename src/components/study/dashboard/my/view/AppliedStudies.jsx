'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import {Spinner} from "@nextui-org/react";

// hooks
import { useAuthenticatedApi } from "@/hooks/useAuthenticatedApi";
import { useAppliedStudyList } from "@/hooks/study/useAppliedStudyList";

// components

// utils
import { formatDate } from "@/utils/formatDate";

export default function AppliedStudies() {
    const router = useRouter();
    const { apiClient } = useAuthenticatedApi();

    // API: useAppliedStudyList
    const { recruitingAppliedStudyList, recruitedAppliedStudyList, isLoading, error } = useAppliedStudyList(apiClient);

    const getStatusBadge = (status) => {
        if (status === 'APPROVED')
            return "bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium";
        if (status === 'REJECTED')
            return "bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium";
        return "bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium";
    };

    const getStatusName = (status) => {
        if (status === 'APPROVED') return '합격';
        if (status === 'REJECTED') return '불합격';
        return '발표 전';
    };

    const handleMyDetailClick = (studyId) => {
        router.push(`/study/my/${encodeURIComponent(studyId)}`);
    };

    const handleDetailClick = (studyId) => {
        router.push(`/study/detail/${encodeURIComponent(studyId)}`);
    };

    const renderTable = (title, data) => (
        <div className="mb-10">
            <h2 className="text-xl md:text-2xl font-bold mb-6">{title}</h2>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="border-b border-gray-200">
                        <th className="py-3 text-left">스터디</th>
                        <th className="py-3 text-left hidden md:table-cell">모집 마감일</th>
                        <th className="py-3 text-center">상태</th>
                        <th className="py-3 text-right hidden md:table-cell"></th>
                    </tr>
                    </thead>
                    <tbody>
                    {data.length > 0 ? (
                        data.map((data) => (
                            <tr
                                key={data.studyId}
                                className="border-b border-gray-200 hover:bg-gray-800 cursor-pointer"
                                onClick={() => handleMyDetailClick(data.studyId)}
                            >
                                <td className="py-4">{data.title}</td>
                                <td className="py-4 hidden md:table-cell">{formatDate(data.recruitEndDate)}</td>
                                <td className="py-4 text-center">
                                        <span className={getStatusBadge(data.status)}>
                                            {getStatusName(data.status)}
                                        </span>
                                </td>
                                <td className="py-4 text-right hidden md:table-cell">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDetailClick(data.studyId);
                                        }}
                                        className="text-blue-500 hover:text-blue-700 text-sm"
                                    >
                                        정보 보기
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="py-4 text-center text-gray-500">
                                데이터가 없습니다.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (<>
            {isLoading ? (
                <div className='flex justify-center items-center h-screen'>
                    <Spinner />
                </div>
            ) : (
                <>
                    {renderTable("모집 중인 스터디", recruitingAppliedStudyList)}
                    {renderTable("모집 완료된 스터디", recruitedAppliedStudyList)}
                </>
            )}
        </>
    );
}