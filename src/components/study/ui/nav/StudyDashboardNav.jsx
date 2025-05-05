import React, { useState } from 'react';

export default function StudyDashboardNav({ isAdminPage = false, studyId = null, currentMenu, onMenuClick }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const myViewMenuItems = [
        { id: 'appliedStudies', label: '스터디 지원 결과' }
    ];
    const myDetailMenuItems = [
        { id: 'studyDetail', label: '스터디 정보' },
        /*{ id: 'attendance', label: '스터디 출석기록' },*/
        /*{ id: 'weakly', label: '스터디 주차별 기록' }*/
    ];

    const adminViewMenuItems = [
        { id: 'createdStudies', label: '개설 스터디 관리' }
    ];
    const adminDetailMenuItems = [
        { id: 'reviewApplication', label: '스터디 신청자 현황' },
        /*{ id: 'attendanceAdmin', label: '스터디 출석기록' },*/
        /*{ id: 'weaklyAdmin', label: '스터디 주차별 기록' }*/
    ];

    const menuOption = isAdminPage ? (studyId == null ? adminViewMenuItems : adminDetailMenuItems) : (studyId == null ? myViewMenuItems : myDetailMenuItems);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleMenuClick = (menuId) => {
        onMenuClick(menuId);
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="w-full md:w-auto bg-black text-white py-2 px-3 rounded-lg mb-4">
            {/* 타이틀 영역 */}
            <div className="flex justify-between items-center border-b border-white pb-2">
                <div className="flex items-center">
                    <h2 className="text-lg font-bold mr-7">
                        MY 스터디 | {isAdminPage ? "관리" : "참여"}
                    </h2>

                    {/* 모바일에서 첫 번째 메뉴 항목을 타이틀 옆에 버튼으로 표시 */}
                    {menuOption.length > 0 && (
                        <div
                            className="md:hidden bg-blue-600 mb-0 text-white text-sm py-1 px-3 rounded-full cursor-pointer"
                            onClick={() => handleMenuClick(currentMenu)}
                        >
                            {menuOption.find(option => option.id === currentMenu).label}
                        </div>
                    )}
                </div>

                <button
                    className="md:hidden flex items-center"
                    onClick={toggleMobileMenu}
                    aria-label="메뉴 열기/닫기"
                >
                    {isMobileMenuOpen ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                    )}
                </button>
            </div>

            {/* 데스크탑 메뉴 - 좌측으로 표시 */}
            <div className="hidden md:flex md:flex-col md:gap-4 md:pt-2">
                {menuOption.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => handleMenuClick(item.id)}
                        className={`py-1 px-3 text-sm cursor-pointer transition-colors duration-200 rounded-full
                            ${currentMenu === item.id
                            ? 'bg-blue-600 text-white'
                            : 'text-white hover:bg-gray-800'
                        }`}
                    >
                        {item.label}
                    </div>
                ))}
            </div>

            {/* 모바일 드롭다운 메뉴 */}
            {isMobileMenuOpen && (
                <div className="md:hidden flex flex-col pt-2">
                    {menuOption.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => handleMenuClick(item.id)}
                            className={`py-2 text-sm cursor-pointer transition-colors duration-200 
                                ${currentMenu === item.id
                                ? 'text-blue-500 font-medium'
                                : 'text-white hover:text-blue-300'
                            }`}
                        >
                            {item.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}