'use client';

import { useContext } from 'react';

import AuthContext, { AuthContextValue } from '@/context/AuthProvider';

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
