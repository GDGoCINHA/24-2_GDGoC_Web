import React, { useState, useEffect } from 'react';
import { useParams } from "next/navigation";

import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';
import { useStudyDetail } from "@/hooks/study/useStudyDetail";

import { getStudyAttendee1 } from '@/mock/studyMocks';

export default function BackendStudyManagement() {
    const pathParams = useParams();
    const studyTitle =  decodeURIComponent(pathParams.title);
    const { apiClient } = useAuthenticatedApi();
    const [applications, setApplications] = useState([]);

    // API: useStudyDetail
    const { studyInfo, studyLeadInfo, isApplied, isLoading, error: studyDetailError } = useStudyDetail();

    // API: get applications
    useEffect(() => {
        const fetchApplications = async () => {
            try {
                if (process.env.NODE_ENV === 'development') {
                    const mockData = getStudyAttendee1.data.applications
                        .filter(app => app.studyId === studyInfo.id)
                        .map(app => ({ ...app, selected: false }));
                    setApplications(mockData);
                } else {
                    const response = await apiClient.get(`/study/${studyInfo.id}/attendees`);
                    const realData = response.data.applications.map(app => ({ ...app, selected: false }));
                    setApplications(realData);
                }
            } catch (error) {
                console.error("Failed to fetch applications:", error);
            }
        };

        if (studyInfo?.id) {
            fetchApplications();
        }
    }, [studyInfo?.id]);

    // Toggle selection for an applicant
    const toggleSelection = (id) => {
        setApplications(applications.map(app =>
            app.id === id ? { ...app, selected: !app.selected } : app
        ));
    };

    // Handle final approval
    const handleApproval = async () => {
        const updateRequests = applications.map(user =>
            apiClient.patch(`/study/${studyInfo.id}/attendee`, {
                studyId: studyInfo.id,
                attendeeId: user.id,
                status: user.selected ? "APPROVED" : "REJECTED"
            })
        );

        await Promise.all(updateRequests);

        const approvedUsers = applications.filter(app => app.selected);
        const rejectedUsers = applications.filter(app => !app.selected);

        console.log("Approved users:", approvedUsers);
        console.log("Rejected users:", rejectedUsers);

        alert(`${approvedUsers.length}명 합격, ${rejectedUsers.length}명 불합격 처리되었습니다.`);
    };

    // Study notification section
    const StudyNotice = () => (
        <div className="bg-gray-900 p-6 rounded-md mb-6">
            <div className="flex items-start">
                <span className="text-2xl mr-3">💡</span>
                <div>
                    <h3 className="font-medium mb-2">모집 관련 주의사항</h3>
                    <ul className="space-y-1">
                        <li>• 모집 마감일 다음 날까지는 자유롭게 합/불 체크가 가능합니다.</li>
                        <li>• 마감일 이전에는 최종 결정 및 마감 버튼으로 조기 마감이 가능합니다.</li>
                        <li>• 모집 마감일 하루 뒤 자정에는 자동으로 마지막으로 체크한 합/불 결과가 반영됩니다.</li>
                        <li>• 지원자는 MY 스터디 참여 현황에서 모집 마감 시간 하루 뒤 합격여부 조회가 가능합니다.</li>
                    </ul>
                </div>
            </div>
        </div>
    );

    // Study information section
    const StudyInfo = () => {
        // Render checkbox based on selection state
        const renderCheckbox = (appId, isSelected) => {
            return (
                <div
                    className="w-6 h-6 mx-auto border border-gray-300 cursor-pointer flex items-center justify-center"
                    onClick={() => toggleSelection(appId)}
                >
                    {isSelected ? "√" : ""} {/* 수학적 감성 무단으로 집어 넣기 */}
                </div>
            );
        };

        return (
            <div>
                <h2 className="text-3xl font-bold mb-6">{studyTitle} 스터디</h2>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-gray-200">
                            <th className="py-3 text-left">이름</th>
                            <th className="py-3 text-left">학과</th>
                            <th className="py-3 text-left">학번</th>
                            <th className="py-3 text-center">합격 여부</th>
                        </tr>
                        </thead>
                        <tbody>
                        {applications.map((app) => (
                            <tr key={app.id} className="border-b border-gray-200">
                                <td className="py-4">{app.name}</td>
                                <td className="py-4">{app.major}</td>
                                <td className="py-4">{app.studentId}</td>
                                <td className="py-4 text-center">
                                    {renderCheckbox(app.id, app.selected)}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 text-center">
                    <button
                        className="border border-green-600 text-green-600 px-4 py-2 rounded hover:bg-green-600 hover:text-white transition-colors"
                        onClick={handleApproval}
                    >
                        인원 확정
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto p-4">
            <StudyNotice />
            <StudyInfo />
        </div>
    );
}