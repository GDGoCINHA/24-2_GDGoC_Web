'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import {Spinner} from "@nextui-org/react";

// hooks
import {useAuthenticatedApi} from "@/hooks/useAuthenticatedApi";
import {useCreatedStudyList} from "@/hooks/study/useCreatedStudyList";
import { useAppliedStudyList } from "@/hooks/study/useAppliedStudyList";

// utils
import { formatDate } from "@/utils/formatDate";

export default function CreatedStudies() {
    const router = useRouter();
    const { apiClient } = useAuthenticatedApi();

    // API: useCreatedStudyList
    const { recruitingCreatedStudyList, recruitedCreatedStudyList, isLoading, error } = useCreatedStudyList(apiClient);

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

    const handleMyDetailClick = (studyId) => {
        router.push(`/study/admin/${encodeURIComponent(studyId)}`);
    };

    const handleDetailClick = (studyId) => {
        router.push(`/study/detail/${encodeURIComponent(studyId)}`);
    };

    const renderTable = (title, data) => (
        <div className="mb-10">
            <h2 className="text-xl md:text-2xl font-bold mb-6">{title}</h2>

            <div className="overflow-x-auto">
                <div className="border border-gray-800 rounded-lg bg-gray-900">
                    <table className="w-full table-auto">
                        <thead>
                        <tr className="bg-gray-800">
                            <th className="hidden md:table-cell w-16 py-3 px-4 text-center font-medium">ID</th>
                            <th className="py-3 px-4 text-left font-medium">스터디명</th>
                            <th className="hidden md:table-cell w-64 py-3 px-4 text-center font-medium">활동기간</th>
                            <th className="hidden md:table-cell w-24 py-3 px-4 text-center font-medium"></th>
                        </tr>
                        </thead>
                        <tbody>
                        {Array.isArray(data) && data.length > 0 ? (
                            data.map((data) => (
                                <tr
                                    key={data.id}
                                    onClick={() => handleMyDetailClick(data.id)}
                                    className="border-t border-gray-800 hover:bg-blue-900 transition-colors duration-200 cursor-pointer"
                                >
                                    <td className="hidden md:table-cell py-3 px-4 text-center">{data.id}</td>
                                    <td className="py-3 px-4">{data.title}</td>
                                    <td className="hidden md:table-cell py-3 px-4 text-center whitespace-nowrap">
                                        {formatDate(data.activityStartDate)} ~ {formatDate(data.activityEndDate)}
                                    </td>
                                    <td className="hidden md:table-cell py-3 px-4 text-right">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDetailClick(data.id);
                                            }}
                                            className="text-blue-500 hover:text-blue-300 text-sm"
                                        >
                                            상세 보기
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="py-8 px-4 text-center text-gray-500">
                                    데이터가 없습니다.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {isLoading ? (
                <div className='flex justify-center items-center h-screen'>
                    <Spinner />
                </div>
            ) : (
                <>
                    {renderTable("모집 중인 스터디", recruitingCreatedStudyList)}
                    {renderTable("모집 완료된 스터디", recruitedCreatedStudyList)}
                </>
            )}
        </>
    );
}