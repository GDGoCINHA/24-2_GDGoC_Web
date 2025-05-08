import * as React from "react";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import localFont from "next/font/local";
import Script from 'next/script';
import { NextUIProvider } from "@nextui-org/react";

// components
import Loading from "@/app/loading";
import Error from "@/app/error";
import { AuthProvider } from '@/app/context/AuthProvider';

// css
import "./globals.css";

const pretendard = localFont({
  src: "../../public/fonts/PretendardVariable.woff2",
  display: "swap",
  variable: "--font-pretendard",
  preload: true,
  fallback: ["system-ui", "arial"]
});

const ocra = localFont({
  src: "../../public/fonts/OCRAExtended.woff2",
  display: "swap",
  variable: "--font-ocra",
  preload: true,
  fallback: ["monospace"]
});

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 1.0,
  minimumScale: 1.0,
  userScalable: true,
  themeColor: "#000000",
  colorScheme: "light dark"
};

export const metadata = {
  metadataBase: new URL('https://gdgocinha.com'),
  title: {
    template: '%s | GDGoC INHA',
    default: 'GDGoC INHA'
  },
  description: "Google Developer Group on Campus at Inha University",
  manifest: "/manifest.json",
  applicationName: "GDGoC INHA",
  keywords: [
    "google", "education", "technology", "developer", "gdg", "gdsc", "gdgoc",
    "google developer group", "google for developers", "google developer groups on campus",
    "inha", "university", "inha university", "구글", "개발자", "동아리", "인하대",
    "인하대학교", "학생", "프로그래밍", "코딩", "개발", "IT", "테크", "테크동아리",
    "웹개발", "앱개발", "클라우드", "AI", "머신러닝", "안드로이드", "iOS",
    "프론트엔드", "백엔드", "풀스택"
  ],
  authors: [{ name: "GDGoC INHA Tech Team" }],
  creator: "GDGoC INHA Tech Team",
  publisher: "GDGoC INHA Tech Team",
  formatDetection: {
    telephone: true,
    date: true,
    address: true,
    email: true,
    url: true
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any", type: "image/x-icon" }
    ],
    apple: [
      { url: "/icons/apple-icon-180x180.png", sizes: "180x180", type: "image/png" }
    ],
    shortcut: ["/favicon.ico"]
  },
  openGraph: {
    title: "GDGoC INHA Univ.",
    description: "Google Developer Group on Campus at Inha University",
    url: "https://gdgocinha.com",
    siteName: "GDGoC INHA",
    images: [
      {
        url: "https://gdgocinha.com/screenshots/home.png",
        width: 1280,
        height: 720,
        alt: "GDGoC INHA Home"
      }
    ],
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "GDGoC INHA Univ.",
    description: "Google Developer Group on Campus at Inha University",
    images: ["https://gdgocinha.com/screenshots/home.png"],
    creator: "GDGoC INHA Tech Team",
  },
  verification: {
    // Google Search Console 등에 사용되는 확인 코드가 있다면 추가
    // google: "VERIFICATION_CODE",
  },
  alternates: {
    canonical: 'https://gdgocinha.com',
    languages: {
      'ko-KR': 'https://gdgocinha.com',
    },
  },
};

export default function RootLayout({ children }) {
  return (
      <html lang='ko' className={`${pretendard.variable} ${ocra.variable}`} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#000000" />
        <link rel="manifest" href="/manifest.json" />
        {/* PWA 관련 메타 태그 */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="GDGoC INHA" />
        <link rel="apple-touch-icon" href="/icons/apple-icon-180x180.png" />
        {/* 외부 스크립트 */}
        <Script
          src="https://unpkg.com/type-hangul@0.2.4/dist/type-hangul.bundle.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={`${pretendard.className} antialiased`}>
        <NextUIProvider>
          <ErrorBoundary fallback={<Error />}>
            <AuthProvider>
              <Suspense fallback={ <Loading/>} >
                {children}
              </Suspense>
            </AuthProvider>
          </ErrorBoundary>
        </NextUIProvider>
      </body>
    </html>
  );
}