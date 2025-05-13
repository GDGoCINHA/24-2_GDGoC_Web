//import { Suspense } from "react";


import MenuHeader from '@/components/ui/common/MenuHeader';

export const metadata = {
    title: "Admin",
    description: "Admin management and participation platform",
};

export default function AdminLayout({ children }) {
    return (
        <>
            <MenuHeader />
            {children}
        </>
    );
}