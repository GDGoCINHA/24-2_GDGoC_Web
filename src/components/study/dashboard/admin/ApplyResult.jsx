import React, { useState } from 'react';
import { useParams } from "next/navigation";

export default function BackendStudyManagement() {
    const pathParams = useParams();
    const studyTitle =  decodeURIComponent(pathParams.title);

    const [applications, setApplications] = useState([
        { id: 1, name: "이재아", place: "컴퓨터공학과", date: "12243954", grade: "2", selected: false },
        { id: 2, name: "이재아", place: "컴퓨터공학과", date: "12243954", grade: "2", selected: false },
        { id: 3, name: "이재아", place: "컴퓨터공학과", date: "12243954", grade: "2", selected: false }
    ]);

    // Toggle selection for an applicant
    const toggleSelection = (id) => {
        setApplications(applications.map(app =>
            app.id === id ? { ...app, selected: !app.selected } : app
        ));
    };

    // Handle final approval
    const handleApproval = () => {
        // Process approvals and rejections
        const approvedUsers = applications.filter(app => app.selected);
        const rejectedUsers = applications.filter(app => !app.selected);

        console.log("Approved users:", approvedUsers);
        console.log("Rejected users:", rejectedUsers);

        alert(`${approvedUsers.length} 명의 지원자가 합격되었습니다.`);
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
                    {isSelected ? "O" : ""}
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
                            <th className="py-3 text-center">학년</th>
                            <th className="py-3 text-center">합격 여부</th>
                        </tr>
                        </thead>
                        <tbody>
                        {applications.map((app) => (
                            <tr key={app.id} className="border-b border-gray-200">
                                <td className="py-4">{app.name}</td>
                                <td className="py-4">{app.place}</td>
                                <td className="py-4">{app.date}</td>
                                <td className="py-4 text-center">{app.grade}</td>
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