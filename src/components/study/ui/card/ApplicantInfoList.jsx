'use client';

import React from 'react';
import GreenTextButton from "@/components/ui/button/GreenTextButton";

export default function ApplicantInfoList({
                                              applications,
                                              studyDetail,
                                              error,
                                              handleApplicantDetailPopup,
                                              toggleSelection,
                                              handleApproval,
                                              isApprovalButtonDisabled,
                                              hasProcessedApplicants
                                          }) {
    if (error) return <div className="text-red-500 text-center">알수없는 에러 발생!</div>;

    // 상태에 따른 뱃지 스타일 반환
    const getStatusBadge = (status) => {
        if (status === 'APPROVED')
            return "bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium";
        if (status === 'REJECTED')
            return "bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium";
        return "bg-gray-300 text-gray-700 px-3 py-1 rounded-full text-sm font-medium";
    };

    // 상태에 따른 텍스트 반환
    const getStatusName = (status) => {
        if (status === 'APPROVED') return '합격';
        if (status === 'REJECTED') return '불합격';
        return '미정';
    };

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">{studyDetail?.title}</h2>
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
                            <tr
                                key={app.id}
                                className="border-b border-gray-200 hover:bg-gray-800 cursor-pointer"
                                onClick={() => handleApplicantDetailPopup(app.id)}
                            >
                                <td className="py-4">{app.name}</td>
                                <td className="py-4">{app.major}</td>
                                <td className="py-4">{app.studentId}</td>
                                <td className="py-4 text-center">
                                    {/* 이미 처리된 지원자가 있으면 상태 뱃지 표시 */}
                                    {hasProcessedApplicants || app.status === 'APPROVED' || app.status === 'REJECTED' ? (
                                        <span className={getStatusBadge(app.status)}>
                                            {getStatusName(app.status)}
                                        </span>
                                    ) : (
                                        /* 처리되지 않은 경우 체크박스 표시 */
                                        <div
                                            className="w-6 h-6 mx-auto border border-gray-300 cursor-pointer flex items-center justify-center"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleSelection(app.id);
                                            }}
                                        >
                                            {app.selected ? "√" : ""}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            <div className="mt-6">
                <GreenTextButton
                    text="인원 확정"
                    isDisabled={isApprovalButtonDisabled}
                    handleClick={handleApproval}
                />
                {isApprovalButtonDisabled && hasProcessedApplicants && (
                    <p className="text-sm text-gray-500 mt-2">
                        이미 처리된 지원자가 있어 수정할 수 없습니다.
                    </p>
                )}
                {isApprovalButtonDisabled && !hasProcessedApplicants && (
                    <p className="text-sm text-gray-500 mt-2">
                        지원 마감일이 지나 자동으로 처리되었습니다.
                    </p>
                )}
            </div>
        </div>
    );
}