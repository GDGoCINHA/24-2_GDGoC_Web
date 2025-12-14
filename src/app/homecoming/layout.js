import {Suspense} from "react";
import Loader from "@/components/ui/common/Loader.jsx";

const siteUrl = new URL("https://gdgocinha.com");

export const metadata = {
    metadataBase: siteUrl,

    title: "Homecoming", description: "GDGoC INHA 제1회 홈커밍 데이 행사 안내 및 참여 페이지",

    alternates: {
        canonical: "/homecoming",
    },

    openGraph: {
        title: "GDGoC INHA 제1회 홈커밍 데이",
        description: "GDGoC INHA가 처음으로 선보이는 홈커밍 데이에 여러분을 초대합니다.",
        url: "/homecoming",
        siteName: "GDGoC INHA",
        images: [{
            url: "/images/homecoming/meta_img.png", width: 1143, height: 750, alt: "GDGoC INHA Homecoming Day",
        },],
        locale: "ko_KR",
        type: "website",
    },

    twitter: {
        card: "summary_large_image",
        title: "GDGoC INHA 제1회 홈커밍 데이",
        description: "GDGoC INHA가 처음으로 선보이는 홈커밍 데이에 여러분을 초대합니다.",
        images: ["/images/homecoming/meta_img.png"],
    },
};

export default function HomecomingLayout({ children }) {
    return children;
}