import React from 'react';

// components
import MyViewArea from "@/components/study/dashboard/my/view/ViewArea";
import MyDetailArea from "@/components/study/dashboard/my/detail/DetailArea";
import AdminViewArea from "@/components/study/dashboard/admin/view/ViewArea";
import AdminDetailArea from "@/components/study/dashboard/admin/detail/DetailArea";

export default function InfoArea({ isAdminPage, studyId=null, currentMenu }) {
    const renderArea = () => {
        if (isAdminPage) {
            return studyId
                ? <AdminDetailArea studyId={studyId} currentMenu={currentMenu} />
                : <AdminViewArea currentMenu={currentMenu} />;
        } else {
            return studyId
                ? <MyDetailArea studyId={studyId} currentMenu={currentMenu} />
                : <MyViewArea currentMenu={currentMenu} />;
        }
    };

    return (
        <div className="w-full md:w-3/4 bg-black text-white p-4 md:p-6 rounded-lg">
            { renderArea() }
        </div>
    );
}