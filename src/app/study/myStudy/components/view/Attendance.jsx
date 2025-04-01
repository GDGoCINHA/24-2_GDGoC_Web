import React, { useEffect, useState } from 'react';

export default function Attendance() {

    const data = {
        myStudies: [
            {id: 1, title: "UI/UX 스터디"},
            {id: 2, title: "백엔드 스터디"}
        ],
        attendance: [
            {id: 1, studyTitle: "UI/UX 스터디", session: 1, date: "2024.03.05", status: "출석"},
            {id: 2, studyTitle: "UI/UX 스터디", session: 2, date: "2024.03.12", status: "결석"},
            {id: 3, studyTitle: "UI/UX 스터디", session: 3, date: "2024.03.19", status: "지각"},
            {id: 4, studyTitle: "UI/UX 스터디", session: 4, date: "2024.03.26", status: "미확인"},
            {id: 5, studyTitle: "UI/UX 스터디", session: 5, date: "2024.04.02", status: "출석"},
        ]
    };

    const getAttendanceBadge = (status) => {
        const baseClasses = "px-3 py-1 rounded-full text-sm font-medium text-white";

        if (status === '출석')
            return `${baseClasses} bg-green-500`;
        if (status === '지각')
            return `${baseClasses} bg-yellow-500`;
        if (status === '결석')
            return `${baseClasses} bg-red-500`;

        return `${baseClasses} bg-blue-700`;
    };

    return (
        <div className="mb-10">
            <h2 className="text-xl md:text-2xl font-bold mb-6">스터디 출석 기록</h2>

            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex items-center space-x-4 mb-4 md:mb-0">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span>출석</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span>지각</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span>결석</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span>미확인</span>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                    <select className="bg-gray-800 border border-gray-700 rounded-md px-4 py-2">
                        <option>모든 스터디</option>
                        {data.myStudies.map(study => (
                            <option key={study.id}>{study.title}</option>
                        ))}
                    </select>
                    <select className="bg-gray-800 border border-gray-700 rounded-md px-4 py-2">
                        <option>모든 기간</option>
                        <option>최근 1개월</option>
                        <option>최근 3개월</option>
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="border border-gray-800 rounded-lg bg-gray-900">
                    <div className="grid grid-cols-5 py-4 px-4 bg-gray-800">
                        <div className="font-bold">스터디</div>
                        <div className="font-bold">회차</div>
                        <div className="font-bold">날짜</div>
                        <div className="font-bold">상태</div>
                        <div></div>
                    </div>

                    {data.attendance.map((record) => (
                        <div key={record.id} className="grid grid-cols-5 py-4 px-4 border-t border-gray-800 hover:bg-blue-900 transition-colors duration-200">
                            <div>{record.studyTitle}</div>
                            <div>{record.session}회차</div>
                            <div>{record.date}</div>
                            <div>
                                <span className={getAttendanceBadge(record.status)}>{record.status}</span>
                            </div>
                            <div className="text-right">
                                <button className="text-blue-400 hover:text-blue-300 text-sm">관련 자료</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}