import React, { useEffect, useState } from 'react';

export default function WeeklyInfo() {
    const data = {
        myStudies: [
            {id: 1, title: "UI/UX 스터디"},
            {id: 2, title: "백엔드 스터디"}
        ],
        weeklyRecords: [
            {
                id: 1,
                title: "1주차 - 엥?",
                date: "2024.03.05",
                status: "COMPLETE",
                link: "google.com",
                description: "햄부기햄북 햄북어 햄북스딱스 함부르크햄부가우가 햄비기햄부거 햄부가티햄부기온앤 온을 차려오거라. 햄부기햄북 햄북어 햄북스딱스 함부르크햄부가우가 햄비기햄부거 햄부가티햄부기온앤 온을 차려오라고 하지않앗느냐"
            },
            {
                id: 2,
                title: "2주차 - 엥엥?",
                date: "2024.03.06",
                status: "COMPLETE",
                link: "google.com",
                description: "햄부기햄북 햄북어 햄북스딱스 함부르크햄부가우가 햄비기햄부거 햄부가티햄부기온앤 온을 차려오거라. 햄부기햄북 햄북어 햄북스딱스 함부르크햄부가우가 햄비기햄부거 햄부가티햄부기온앤 온을 차려오라고 하지않앗느냐"
            },
            {
                id: 3,
                title: "3주차 - 엥엥엥?",
                date: "2024.03.07",
                status: "COMPLETE",
                link: "google.com",
                description: "햄부기햄북 햄북어 햄북스딱스 함부르크햄부가우가 햄비기햄부거 햄부가티햄부기온앤 온을 차려오거라. 햄부기햄북 햄북어 햄북스딱스 함부르크햄부가우가 햄비기햄부거 햄부가티햄부기온앤 온을 차려오라고 하지않앗느냐"
            },
            {
                id: 4,
                title: "4주차 - 엥엥엥엥?",
                date: "2024.03.08",
                status: "INPROGRESS",
                link: "google.com",
                description: "햄부기햄북 햄북어 햄북스딱스 함부르크햄부가우가 햄비기햄부거 햄부가티햄부기온앤 온을 차려오거라. 햄부기햄북 햄북어 햄북스딱스 함부르크햄부가우가 햄비기햄부거 햄부가티햄부기온앤 온을 차려오라고 하지않앗느냐"
            }
        ]
    };

    return (
        <div className="mb-10">
            <h2 className="text-xl md:text-2xl font-bold mb-6">스터디 주차별 기록</h2>

            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
                <select className="bg-gray-800 border border-gray-700 rounded-md px-4 py-2 mb-4 md:mb-0 w-full md:w-64">
                    {data.myStudies.map(study => (
                        <option key={study.id}>{study.title}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.weeklyRecords.map((week) => (
                    <div key={week.id} className="border border-gray-800 rounded-lg bg-gray-900 overflow-hidden hover:border-blue-600 transition-colors duration-200">
                        <div className="bg-gray-800 p-4">
                            <h3 className="font-bold">{week.title}</h3>
                            <p className="text-sm text-gray-400">{week.date}</p>
                        </div>
                        <div className="p-4">
                            <div className="flex items-center mb-3">
                                <div className={`w-2 h-2 rounded-full ${week.status === 'COMPLETE' ? 'bg-green-500' : 'bg-yellow-500'} mr-2`}></div>
                                <span className="text-sm">{week.status}</span>
                            </div>
                            <p className="text-sm text-gray-300 mb-4 line-clamp-2">{week.description}</p>
                            <div className="flex justify-end">
                                <button className="text-blue-400 hover:text-blue-300 text-sm"><a href={week.link}>자료 보기</a></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}