import * as React from "react";
import "./globals.css";
import { NextUIProvider } from "@nextui-org/react";
import localFont from "next/font/local";

const pretendard = localFont({
  src: "../../public/fonts/PretendardVariable.woff2",
  display: "swap",
  variable: '--font-pretendard'
});

const ocra = localFont({
  src: "../../public/fonts/OCRAExtended.woff2",
  display: "swap",
  variable: '--font-ocra'
});

export const metadata = {
  title: "GDGoC INHA",
  description: "GDGoC INHA",
};

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 1.0,
  minimumScale: 1.0,
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" className={`${pretendard.variable} ${ocra.variable}`}>
      <head>
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