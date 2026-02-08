import type { Metadata } from 'next'
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'SignIn',
  description: 'SignIn to your account',
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <div className='min-h-screen flex flex-col overflow-hidden relative'>
      {children}
    </div>
  );
}
