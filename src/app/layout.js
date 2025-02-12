import * as React from "react";
import "./globals.css";
import { NextUIProvider } from "@nextui-org/react";
import localFont from "next/font/local";

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

export const metadata = {
  title: "GDGoC INHA",
  description: "개발자와 비개발자가 같이 성장하는 즐거움 with Google",
  icons: {
    icon: "/favicon.ico", 
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" className={`${pretendard.variable} ${ocra.variable}`}>
      <head>
        <meta name="description" content="개발자와 비개발자가 같이 성장하는 즐거움 with Google" />
        <script src="https://unpkg.com/type-hangul" async></script>
      </head>
      <body className={pretendard.className}>
        <NextUIProvider>
          {children}
        </NextUIProvider>
      </body>
    </html>
  );
}
