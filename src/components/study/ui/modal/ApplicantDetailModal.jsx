'use client';

import { useEffect } from 'react';
import { Spinner } from "@nextui-org/react";

// API Services
import { useApplicantDetail } from '@/services/study/useApplicantDetail';

export default function ApplicantDetailModal({ apiClient, studyId, selectedApplicant, setIsModalOpen, disableSelection = false }) {
    const { applicantDetail, isLoading, error } = useApplicantDetail(apiClient, studyId, selectedApplicant?.id);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    // Status badge styles
    const getStatusBadge = (status) => {
        if (status === 'APPROVED')
            return "bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium";
        if (status === 'REJECTED')
            return "bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium";
        return "bg-gray-300 text-gray-700 px-3 py-1 rounded-full text-sm font-medium";
    };

    // Status text
    const getStatusName = (status) => {
        if (status === 'APPROVED') return '합격';
        if (status === 'REJECTED') return '불합격';
        return '미정';
    };

    if (!selectedApplicant || error) return null;

    return (
        isLoading ? (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <Spinner />
            </div>
        ) : (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-gray-100 text-black rounded-lg p-6 w-11/12 max-w-md max-h-[70vh] overflow-y-auto scrollbar scrollbar-thumb-gray-400 scrollbar-track-gray-200">
                    <h3 className="text-xl font-semibold mb-4">지원자 상세 정보</h3>
                    <table className="w-full text-left border-2 border-gray-400">
                        <tbody>
                        <tr className="border-b-2 border-gray-400">
                            <th className="p-2 w-1/2 bg-gray-200 border-r-2 border-gray-400 text-center">이름</th>
                            <th className="p-2 w-1/2 bg-gray-200 text-center">전화번호</th>
                        </tr>
                        <tr className="border-b-2 border-gray-400">
                            <td className="p-2 border-r-2 border-gray-400 text-center">{applicantDetail.name}</td>
                            <td className="p-2 text-center">{applicantDetail.phone}</td>
                        </tr>
                        <tr className="border-b-2 border-gray-400">
                            <th className="p-2 bg-gray-200 border-r-2 border-gray-400 text-center">학과</th>
                            <th className="p-2 bg-gray-200 text-center">학번</th>
                        </tr>
                        <tr className="border-b-2 border-gray-400">
                            <td className="p-2 border-r-2 border-gray-400 text-center">{applicantDetail.major}</td>
                            <td className="p-2 text-center">{applicantDetail.studentId}</td>
                        </tr>
                        <tr className="border-b-2 border-gray-400">
                            <th className="p-2 bg-gray-200 text-center" colSpan={2}>자기 소개</th>
                        </tr>
                        <tr className="border-b-2 border-gray-400">
                            <td className="p-2 text-left" colSpan={2}>{applicantDetail.introduce}</td>
                        </tr>
                        <tr className="border-b-2 border-gray-400">
                            <th className="p-2 bg-gray-200 text-center" colSpan={2}>활동 시간</th>
                        </tr>
                        <tr>
                            <td className="p-2 text-left" colSpan={2}>{applicantDetail.activityTime}</td>
                        </tr>
                        </tbody>
                    </table>
                    <div className="mt-6 flex justify-between items-center">
                        <div className="flex items-center">
                            <label className="mr-2 font-semibold">합격 여부</label>
                            {disableSelection || selectedApplicant.status === 'APPROVED' || selectedApplicant.status === 'REJECTED' ? (
                                <span className={getStatusBadge(selectedApplicant.status)}>
                                    {getStatusName(selectedApplicant.status)}
                                </span>
                            ) : (
                                <input
                                    type="checkbox"
                                    checked={selectedApplicant.selected}
                                    onChange={() => {
                                        setIsModalOpen(false);
                                        const event = new CustomEvent("toggle-applicant-selection", {
                                            detail: { applicantId: selectedApplicant.id }
                                        });
                                        window.dispatchEvent(event);
                                    }}
                                    className="w-5 h-5"
                                />
                            )}
                        </div>
                        <button
                            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
                            onClick={() => setIsModalOpen(false)}
                        >
                            닫기
                        </button>
                    </div>
                </div>
            </div>
        )
    );
}