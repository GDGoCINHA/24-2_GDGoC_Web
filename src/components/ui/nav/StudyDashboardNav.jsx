import React, { useEffect, useState } from 'react';

export default function StudyDashboardNav({ isAdminPage = false, currentMenu, onMenuClick }) {
    const myMenuItems = [
        { id: 'applyResult', label: '스터디 지원 결과' },
        { id: 'attendance', label: '스터디 출석기록' },
        { id: 'weakly', label: '스터디 주차별 기록' }
    ];
    const adminMenuItems = [
        { id: 'applyResultAdmin', label: '스터디 신청자 현황' },
        { id: 'attendanceAdmin', label: '스터디 출석기록' },
        { id: 'weaklyAdmin', label: '스터디 주차별 기록' }
    ];

    const menuOption = isAdminPage ? adminMenuItems : myMenuItems;

    return (
        <div className="w-full md:w-1/4 bg-black text-white p-4 md:p-6 rounded-lg">
            <div className="mb-8">
                <h2 className="text-xl md:text-2xl font-bold mb-6 border-b border-white pb-4">
                    MY 스터디 | {isAdminPage ? "관리" : "참여"}
                </h2>

                {menuOption.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => onMenuClick(item.id)}
                        className={`py-3 text-base md:text-lg cursor-pointer transition-colors duration-200 
                            ${currentMenu === item.id
                            ? 'text-blue-500 font-medium'
                            : 'text-white hover:text-blue-300'
                        }`}
                    >
                        {item.label}
                    </div>
                ))}
            </div>
        </div>
    );
}