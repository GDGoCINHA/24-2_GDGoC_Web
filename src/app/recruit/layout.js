import { Suspense } from "react";
import Loader from '@/components/ui/Loader.jsx';

export const metadata = {
    title: "Recruit",
    description: "Recruitment management and participation platform",
};

export default function RecruitLayout({ children }) {
    return (
        <Suspense fallback={ <Loader /> }>
            {children}
        </Suspense>
    );
}