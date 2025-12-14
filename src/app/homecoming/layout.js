import { Suspense } from "react";
import Loader from '@/components/ui/common/Loader.jsx';

export const metadata = {
    title: "Homecoming",
    description: "GDGoC INHA 제1회 홈커밍 데이 행사 안내 및 참여 페이지",

    openGraph: {
        title: "GDGoC INHA 제1회 홈커밍 데이",
        description: "GDGoC INHA가 처음으로 선보이는 홈커밍 데이에 여러분을 초대합니다.",
        url: "https://gdgocinha.com/homecoming",
        siteName: "GDGoC INHA",
        images: [
            {
                url: "/images/homecoming/meta_img.png", // 🔥 메타 이미지
                width: 1200,
                height: 630,
                alt: "GDGoC INHA Homecoming Day",
            },
        ],
        locale: "ko_KR",
        type: "website",
    },
};

export default function HomecomingLayout({ children }) {
    return (
        <Suspense fallback={<Loader />}>
            {children}
        </Suspense>
    );
}