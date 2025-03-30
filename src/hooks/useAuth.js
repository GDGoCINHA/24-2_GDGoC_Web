'use client'
import { useContext } from 'react';
import AuthContext from '@/app/context/AuthProvider';

export const useAuth = () => useContext(AuthContext);