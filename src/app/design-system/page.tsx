'use client'

import { DesignSystemShowcase } from '@/components/ui/design-system/DesignSystemShowcase'
import { GdgSiteFooter, GdgSiteHeader } from '@/components/ui/design-system'

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-black px-4 py-10 text-white">
      <GdgSiteHeader />
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Internal Only</p>
          <h1 className="mt-2 text-3xl font-bold">GDGoC Design System</h1>
          <p className="text-sm text-white/60">
            개발 중 확인용 임시 페이지입니다. PR 시 제거 예정.
          </p>
        </div>
        <DesignSystemShowcase />
      </div>
      <GdgSiteFooter />
    </div>
  )
}
