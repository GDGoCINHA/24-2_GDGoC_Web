//import { Suspense } from "react";
import MenuHeader from "@/components/ui/common/MenuHeader";
import ApiCodeGuard from '@/components/auth/ApiCodeGuard.jsx';

export const metadata = {
    title: "Home",
    description: "Home management and participation platform",
};

export default function HomeLayout({ children }) {
    return (
        <ApiCodeGuard>
            <>
                <MenuHeader />
                {children}
            </>
        </ApiCodeGuard>
    );
}