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
                title: "1주차 - UI 기초 개념",
                date: "2024.03.05",
                status: "완료",
                link: "google.com",
                description: "사용자 인터페이스 디자인의 기본 원칙과 사용성에 대한 기본 개념 학습"
            },
            {
                id: 2,
                title: "2주차 - UX 리서치 방법론",
                date: "2024.03.12",
                status: "완료",
                link: "google.com",
                description: "사용자 경험 분석을 위한 다양한 리서치 방법 학습 및 실습"
            },
            {
                id: 3,
                title: "3주차 - 와이어프레임 작성",
                date: "2024.03.19",
                status: "완료",
                link: "google.com",
                description: "효과적인 와이어프레임 작성 기법과 프로토타이핑 도구 활용 방법"
            },
            {
                id: 4,
                title: "4주차 - 사용자 테스트",
                date: "2024.03.26",
                status: "진행 중",
                link: "google.com",
                description: "프로토타입을 통한 사용자 테스트 방법과 피드백 수집 및 분석"
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
                                <div className={`w-2 h-2 rounded-full ${week.status === '완료' ? 'bg-green-500' : 'bg-yellow-500'} mr-2`}></div>
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