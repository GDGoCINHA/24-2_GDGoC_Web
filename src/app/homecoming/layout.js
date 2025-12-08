import { Suspense } from "react";
import Loader from '@/components/ui/common/Loader.jsx';

export const metadata = {
    title: "Homecoming",
    description: "GDGoC INHA 제1회 홈커밍 데이 행사 안내 및 참여 페이지",
};

export default function HomecomingLayout({ children }) {
    return (
        <Suspense fallback={ <Loader /> }>
            {children}
        </Suspense>
    );
}