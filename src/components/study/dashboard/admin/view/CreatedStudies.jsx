'use client';

import { useRouter } from "next/navigation";
import { Spinner } from "@nextui-org/react";

// hooks
import {useAuthenticatedApi} from "@/hooks/useAuthenticatedApi";

// API services
import { useCreatedStudyList } from "@/services/study/useCreatedStudyList";
import { useAppliedStudyList } from "@/services/study/useAppliedStudyList";

// utils
import { formatDate } from "@/utils/formatDate";

export default function CreatedStudies() {
    const { apiClient } = useAuthenticatedApi();
    const router = useRouter();

    // API: useCreatedStudyList
    const { recruitingCreatedStudyList, recruitedCreatedStudyList, isLoading, error } = useCreatedStudyList(apiClient);

    // Status color
    const getStatusBadge = (status) => {
        if (status === 'APPROVED')
            return "bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium";
        if (status === 'REJECTED')
            return "bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium";
        return "bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium";
    };

    // Status text
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
                <table className="w-full text-sm">
                    <thead>
                    <tr className="border-b border-gray-200">
                        <th className="py-3 text-left w-6">ID</th>
                        <th className="py-3 text-left w-7/12">스터디명</th>
                        <th className="hidden md:table-cell py-3 text-left w-32">활동기간</th>
                        <th className="py-3 text-right w-12"></th>
                    </tr>
                    </thead>
                    <tbody>
                    {Array.isArray(data) && data?.length > 0 ? (
                        data.map((data) => (
                            <tr
                                key={data.id}
                                onClick={() => handleMyDetailClick(data.id)}
                                className="border-b border-gray-200 hover:bg-gray-800 cursor-pointer"
                            >
                                <td className="py-4">{data.id}</td>
                                <td className="py-4 w-7/12">{data.title}</td>
                                <td className="hidden md:table-cell py-4 whitespace-nowrap">
                                    {formatDate(data.activityStartDate)} ~ {formatDate(data.activityEndDate)}
                                </td>
                                <td className="py-4 text-right">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDetailClick(data.id);
                                        }}
                                        className="text-blue-500 hover:text-blue-700 text-sm"
                                    >
                                        상세 보기
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