'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from "@nextui-org/react";

// hooks
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';
import { useStudyDetail } from "@/hooks/study/useStudyDetail";
import { useApplicantList } from "@/hooks/study/useApplicantList";
import { useStudyAccessCheck } from "@/hooks/study/useStudyAccessCheck";

export default function ReviewApplication({ studyId }) {
    const router = useRouter();
    const { apiClient } = useAuthenticatedApi();
    const [applications, setApplications] = useState([]);

    const {
        isStudyApplicant,
        isStudyLead,
        isLoading: accessLoading,
        error: accessError,
    } = useStudyAccessCheck(apiClient, studyId);

    const {
        studyDetail,
        isLoading: detailLoading,
        error: detailError,
    } = useStudyDetail(apiClient, studyId);

    const {
        applicantList,
        isLoading: listLoading,
        error: listError,
    } = useApplicantList(apiClient, studyId);

    const isLoading = accessLoading || detailLoading || listLoading;
    const error = accessError || detailError || listError;

    useEffect(() => {
        if (applicantList && Array.isArray(applicantList)) {
            setApplications(applicantList.map(app => ({ ...app, selected: false })));
        }
    }, [applicantList]);

    const toggleSelection = (id) => {
        setApplications(prev =>
            prev.map(app =>
                app.id === id ? { ...app, selected: !app.selected } : app
            )
        );
    };

    const handleApproval = async () => {
        if (!applications || applications.length === 0) {
            alert('지원자가 없습니다.');
            return;
        }

        try {
            const payload = {
                attendees: applications.map(app => ({
                    attendeeId: app.id,
                    status: app.selected ? "APPROVED" : "REJECTED",
                })),
            };

            await apiClient.patch(`/studies/${studyId}/applicants/status`, payload);

            const approved = applications.filter(app => app.selected);
            const rejected = applications.filter(app => !app.selected);

            alert(`${approved.length}명 합격, ${rejected.length}명 불합격 처리되었습니다.`);
        } catch (e) {
            console.error('승인 처리 중 오류 발생:', e);
            alert('처리 중 오류가 발생했습니다.');
        }
    };

    const NoticeBanner = () => (
        <div className="bg-gray-900 p-6 rounded-md mb-6">
            <div className="flex items-start">
                <span className="text-2xl mr-3">💡</span>
                <div>
                    <h3 className="font-medium mb-2">모집 관련 주의사항</h3>
                    <ul className="space-y-1 text-sm">
                        <li>• 모집 마감일 다음 날까지는 자유롭게 합/불 체크가 가능합니다.</li>
                        <li>• 마감일 이전에는 최종 결정 및 마감 버튼으로 조기 마감이 가능합니다.</li>
                        <li>• 모집 마감일 하루 뒤 자정에는 자동으로 마지막으로 체크한 합/불 결과가 반영됩니다.</li>
                        <li>• 지원자는 MY 스터디 참여 현황에서 모집 마감 시간 하루 뒤 합격여부 조회가 가능합니다.</li>
                    </ul>
                </div>
            </div>
        </div>
    );

    const ApplicantInfoList = () => {
        if (error) return <div className="text-red-500 text-center">에러 발생: {error.message}</div>;

        return (
            <div>
                <h2 className="text-3xl font-bold mb-6">{studyDetail?.title} 스터디</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="py-3 text-left">이름</th>
                                <th className="py-3 text-left">학과</th>
                                <th className="py-3 text-left">학번</th>
                                <th className="py-3 text-center">합격 여부</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applications.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-4 text-center text-gray-500">
                                        아직 지원자가 없습니다. ㅠㅠ
                                    </td>
                                </tr>
                            ) : (
                                applications.map(app => (
                                    <tr key={app.id} className="border-b border-gray-200">
                                        <td className="py-4">{app.name}</td>
                                        <td className="py-4">{app.major}</td>
                                        <td className="py-4">{app.studentId}</td>
                                        <td className="py-4 text-center">
                                            <div
                                                className="w-6 h-6 mx-auto border border-gray-300 cursor-pointer flex items-center justify-center"
                                                onClick={() => toggleSelection(app.id)}
                                            >
                                                {app.selected ? "✓" : ""}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6 text-center">
                    <button
                        className="border border-green-600 text-green-600 px-4 py-2 rounded hover:bg-green-600 hover:text-white transition"
                        onClick={handleApproval}
                    >
                        인원 확정
                    </button>
                </div>
            </div>
        );
    };

    return (
        isLoading ? (
            <div className="flex justify-center items-center h-screen">
                <Spinner />
            </div>
        ) : (
            <>
            {isStudyLead ? (
                    <div className="max-w-6xl mx-auto p-4">
                        <NoticeBanner />
                        <ApplicantInfoList />
                    </div>
                ) : (
                <div className="max-w-6xl mx-auto p-4">
                    <h2 className="text-3xl font-bold mb-6">접근 권한이 없습니다.</h2>
                    </div>
                )}
            </>
        )
    );
}