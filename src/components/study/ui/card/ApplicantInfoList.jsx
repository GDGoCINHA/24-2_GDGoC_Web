'use client';

import React from 'react';

import GreenTextButton from "@/components/ui/button/GreenTextButton";

export default function ApplicantInfoList({ applications, studyDetail, error, handleApplicantDetailPopup, toggleSelection, handleApproval }) {
    if (error) return <div className="text-red-500 text-center">알수없는 에러 발생!</div>;

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
                                    <div
                                        className="w-6 h-6 mx-auto border border-gray-300 cursor-pointer flex items-center justify-center"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleSelection(app.id);
                                        }}
                                    >
                                        {app.selected ? "√" : ""}
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            <GreenTextButton text="인원 확정" isDisabled={false} handleClick={handleApproval} />
        </div>
    );
}