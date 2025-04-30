'use client';
import React from 'react';
import { Spinner } from "@nextui-org/react";
import { useApplicantDetail } from '@/hooks/study/useApplicantDetail';

export default function ApplicantDetailModal({ apiClient, studyId, selectedApplicant, setIsModalOpen }) {
    const { applicantDetail, isLoading, error } = useApplicantDetail(apiClient, studyId, selectedApplicant?.id);

    React.useEffect(() => {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }, []);

    if (!selectedApplicant || error) return null;

    return (
        isLoading ? (
            <div className="flex justify-center items-center h-screen">
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