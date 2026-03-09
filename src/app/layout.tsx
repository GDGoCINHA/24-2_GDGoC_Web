import * as React from 'react'
import { Suspense } from 'react'
import localFont from 'next/font/local'
import Script from 'next/script'
import { NextUIProvider } from '@nextui-org/react'
import DevHeader from '@/components/ui/common/DevHeader'

// components
import Loading from '@/app/loading'
import { AuthProvider } from '@/context/AuthProvider'

// css
import '@/styles/globals.css'

const pretendard = localFont({
  src: '../../public/fonts/pretendard/PretendardVariable.woff2',
  display: 'swap',
  variable: '--font-local-pretendard',
  preload: true,
  weight: '100 900',
  style: 'normal',
  fallback: ['system-ui', 'arial']
})

const googleSansFlex = localFont({
  src: '../../public/fonts/google-sans-flex/google-sans-flex.woff2',
  display: 'swap',
  variable: '--font-local-google-sans-flex',
  preload: true,
  weight: '100 1000',
  style: 'normal',
  fallback: ['Pretendard', 'sans-serif']
})

const ocra = localFont({
  src: '../../public/fonts/OCRAExtended.woff2',
  display: 'swap',
  variable: '--font-local-ocra',
  preload: true,
  weight: '400',
  style: 'normal',
  fallback: ['monospace']
})

const stardust = localFont({
  src: '../../public/fonts/stardust/Stardust.woff2',
  display: 'swap',
  variable: '--font-local-stardust',
  preload: true,
  weight: '400',
  style: 'normal',
  fallback: ['Pretendard', 'sans-serif']
})

const dunggeunmo = localFont({
  src: '../../public/fonts/dunggeunmo/DungGeunMo.woff2',
  display: 'swap',
  variable: '--font-local-dunggeunmo',
  preload: true,
  weight: '400',
  style: 'normal',
  fallback: ['Pretendard', 'sans-serif']
})

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 1.0,
  minimumScale: 1.0,
  userScalable: true,
  themeColor: '#000000',
  colorScheme: 'light dark'
}

export const metadata = {
  metadataBase: new URL('https://gdgocinha.com'),
  title: {
    template: '%s | GDGoC INHA',
    default: 'GDGoC INHA'
  },
  description: 'Google Developer Group on Campus at Inha University',
  manifest: '/manifest.json',
  applicationName: 'GDGoC INHA',
  keywords: [
    'google',
    'education',
    'technology',
    'developer',
    'gdg',
    'gdsc',
    'gdgoc',
    'google developer group',
    'google for developers',
    'google developer groups on campus',
    'inha',
    'university',
    'inha university',
    '구글',
    '개발자',
    '동아리',
    '인하대',
    '인하대학교',
    '학생',
    '프로그래밍',
    '코딩',
    '개발',
    'IT',
    '테크',
    '테크동아리',
    '웹개발',
    '앱개발',
    '클라우드',
    'AI',
    '머신러닝',
    '안드로이드',
    'iOS',
    '프론트엔드',
    '백엔드',
    '풀스택'
  ],
  authors: [{ name: 'GDGoC INHA Tech Team' }],
  creator: 'GDGoC INHA Tech Team',
  publisher: 'GDGoC INHA Tech Team',
  formatDetection: {
    telephone: true,
    date: true,
    address: true,
    email: true,
    url: true
  },
  icons: {
    icon: [{ url: '/favicon.ico', sizes: 'any', type: 'image/x-icon' }],
    apple: [{ url: '/icons/gdgocIcon/180x180.png', sizes: '180x180', type: 'image/png' }],
    shortcut: ['/favicon.ico']
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'GDGoC INHA'
  },
  openGraph: {
    title: 'GDGoC INHA Univ.',
    description: 'Google Developer Group on Campus at Inha University',
    url: 'https://gdgocinha.com',
    siteName: 'GDGoC INHA',
    images: [
      {
        url: 'https://gdgocinha.com/screenshots/home.png',
        width: 1280,
        height: 720,
        alt: 'GDGoC INHA Home'
      }
    ],
    type: 'website',
    locale: 'ko_KR'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GDGoC INHA Univ.',
    description: 'Google Developer Group on Campus at Inha University',
    images: ['https://gdgocinha.com/screenshots/home.png'],
    creator: 'GDGoC INHA Tech Team'
  },
  verification: {
    // Google Search Console 등에 사용되는 확인 코드가 있다면 추가
    // google: "VERIFICATION_CODE",
  },
  alternates: {
    canonical: 'https://gdgocinha.com',
    languages: {
      'ko-KR': 'https://gdgocinha.com'
    }
  }
}

export default function RootLayout({ children }) {
  return (
    <html
      lang="ko"
      className={`${pretendard.variable} ${ocra.variable} ${googleSansFlex.variable} ${stardust.variable} ${dunggeunmo.variable} dark`}
      style={{ colorScheme: 'dark' }}
      suppressHydrationWarning
    >
      <body
        className={`${pretendard.className} antialiased`}
        style={{ WebkitTextSizeAdjust: '100%' }}
        suppressHydrationWarning
      >
        <Script
          src="https://unpkg.com/type-hangul@0.2.4/dist/type-hangul.bundle.js"
          strategy="beforeInteractive"
        />
        {(process.env.NEXT_PUBLIC_APP_ENV ?? process.env.NODE_ENV) !== 'production' && (
          <DevHeader />
        )}
        <NextUIProvider>
          <AuthProvider>
            <Suspense fallback={<Loading />}>{children}</Suspense>
          </AuthProvider>
        </NextUIProvider>
      </body>
    </html>
  )
}
