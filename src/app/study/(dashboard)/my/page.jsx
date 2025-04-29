'use client';

import React, { useState } from "react";
import { Spinner } from "@nextui-org/react";
import StudyHeader from '@/components/study/StudyHeader';
import StudyDashboardNav from "@/components/ui/nav/StudyDashboardNav";
import InfoArea from "@/components/study/dashboard/InfoArea";

export default function MyStudy() {
    const [isLoading, setIsLoading] = useState(false);
    const [activeMenu, setActiveMenu] = useState('applyResult');

    // check if logged in
    // check if admin

    const handleMenuClick = (menuId) => {
        setActiveMenu(menuId);
    };

    return (
        <>
            {isLoading ? (
                <div className='flex justify-center items-center h-screen'>
                    <Spinner color="primary" size="lg" />
                </div>
            ) : (
                <>
                    <StudyHeader />
                    <div className="container mx-auto px-4 py-8">
                        <div className="flex flex-col md:flex-row gap-6 mt-6 md:mt-10">
                            <StudyDashboardNav
                                isAdminPage={false}
                                currentMenu={activeMenu}
                                onMenuClick={handleMenuClick}
                            />
                            <InfoArea currentMenu={activeMenu} isAdmin={false} />
                        </div>
                    </div>
                </>
            )}
        </>
    );
};