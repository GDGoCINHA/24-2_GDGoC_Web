import { Suspense } from "react";
import Loader from '@/components/ui/common/Loader.jsx';

export const metadata = {
    title: "Core Recruit",
    description: "GDGoC INHA Core Member Recruitment Form",
};

export default function CoreRecruitLayout({ children }) {
    return (
        <Suspense fallback={ <Loader /> }>
            {children}
        </Suspense>
    );
}


