'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { useAuth } from '@/hooks/useAuth'

export default function Home() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    router.replace(user ? '/' : '/onboarding')
  }, [router, user])

  return <main className="min-h-screen bg-black" />
}
