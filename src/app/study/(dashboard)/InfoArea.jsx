import React, { useEffect, useState } from 'react';
import ResultView from "./components/my/ApplyResult";
import AttendanceView from "./components/my/Attendance";
import WeeklyView from "./components/my/WeeklyInfo";

import ResultViewAdmin from "./components/admin/ApplyResult";

export default function InfoArea({ currentMenu, isAdmin }) {
    const renderContent = () => {
        switch(currentMenu) {
            case 'applyResult':
                return <ResultView />;
            case 'attendance':
                alert("현재 기능 준비 중입니다.");
                return;
                //return <AttendanceView />;
            case 'weakly':
                alert("현재 기능 준비 중입니다.");
                return;
                //return <WeeklyView />;
            default:
                return <ResultView />;
        }
    };

    const renderAdminContent = () => {
        switch(currentMenu) {
            case 'applyResultAdmin':
                return <ResultViewAdmin />;
            case 'attendance':
                alert("현재 기능 준비 중입니다.");
                return;
            //return <AttendanceViewAdmin />;
            case 'weakly':
                alert("현재 기능 준비 중입니다.");
                return;
            //return <WeeklyViewAdmin />;
            default:
                alert("현재 기능 준비 중입니다.");
                return;
                //return <ResultViewAdmin />;
        }
    };

    return (
        <div className="w-full md:w-3/4 bg-black text-white p-4 md:p-6 rounded-lg">
            {isAdmin ?  (
                renderAdminContent()
            ) : (
                renderContent()
            )}
        </div>
    );
}