import type { Metadata } from 'next'
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: '로그인',
  description: 'GDGoC INHA 계정으로 로그인하세요.',
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <div className='min-h-screen flex flex-col overflow-hidden relative'>
      {children}
    </div>
  );
}
