'use client';

import React, { useState } from "react";
import { useParams } from 'next/navigation';
import { Spinner } from "@nextui-org/react";

// components
import StudyHeader from '@/components/study/StudyHeader';
import StudyDashboardNav from "@/components/study/ui/nav/StudyDashboardNav";
import InfoArea from "@/components/study/dashboard/InfoArea";

export default function AdminDetailDashboard() {
    const [isLoading, setIsLoading] = useState(false);
    const [activeMenu, setActiveMenu] = useState('applyResult');
    const pathParams = useParams();
    const studyId =  decodeURIComponent(pathParams.id);

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
                                isAdminPage={true}
                                studyId={ studyId }
                                currentMenu={activeMenu}
                                onMenuClick={handleMenuClick}
                            />
                            <InfoArea isAdminPage={true} studyId={ studyId } currentMenu={activeMenu} />
                        </div>
                    </div>
                </>
            )}
        </>
    );
};