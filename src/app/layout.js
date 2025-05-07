import * as React from "react";
import "./globals.css";
import { NextUIProvider } from "@nextui-org/react";
import localFont from "next/font/local";
import { AuthProvider } from '@/app/context/AuthProvider';

const pretendard = localFont({
  src: "../../public/fonts/PretendardVariable.woff2",
  display: "swap",
  variable: "--font-pretendard"
});

const ocra = localFont({
  src: "../../public/fonts/OCRAExtended.woff2",
  display: "swap",
  variable: "--font-ocra"
});

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 1.0,
  minimumScale: 1.0,
  themeColor: "#4285F4",
};

export const metadata = {
  title: "GDGoC INHA",
  description: "Google Developer Student Clubs Gochang - 구글 개발자 학생 클럽 고창",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192x192.png",
  },
  openGraph: {
    title: "GDGoC INHA",
    description: "Google Developer Student Clubs Gochang - 구글 개발자 학생 클럽 고창",
    url: "https://gdgocinha.com",
    siteName: "GDGoC INHA",
    images: [
      {
        url: "https://gdgocinha.com/logo.png",
        width: 1200,
        height: 630,
        alt: "GDGoC INHA Logo"
      }
    ],
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "GDGoC INHA",
    description: "Google Developer Student Clubs Gochang - 구글 개발자 학생 클럽 고창",
    images: ["https://gdgocinha.com/logo.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang='ko' className={`${pretendard.variable} ${ocra.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <script src='https://unpkg.com/type-hangul@0.2.4/dist/type-hangul.bundle.js' async></script>
      </head>
      <body className={pretendard.className}>
        <NextUIProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </NextUIProvider>
      </body>
    </html>
  );
}
