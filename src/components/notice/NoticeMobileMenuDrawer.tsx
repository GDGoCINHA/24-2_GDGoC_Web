'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { ChevronRight, LogOut } from 'lucide-react'
import { usePathname } from 'next/navigation'

import { useAuth } from '@/hooks/useAuth'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import { cn } from '@/utils/cn'

export interface NoticeMobileMenuItem {
  label: string
  href?: string
  onClick?: () => void
}

export interface NoticeMobileMenuDrawerProps {
  open: boolean
  onClose: () => void
  menus: NoticeMobileMenuItem[]
}

const ROLE_BADGE_STYLE: Record<string, string> = {
  CORE: 'bg-green-400 text-green',
  LEAD: 'bg-green-400 text-green',
  ORGANIZER: 'bg-green-400 text-green',
  ADMIN: 'bg-green-400 text-green',
  MEMBER: 'bg-[#17386E] text-blue'
}

export const NoticeMobileMenuDrawer = ({
  open,
  onClose,
  menus
}: NoticeMobileMenuDrawerProps) => {
  const { user } = useAuth()
  const { handleLogout } = useAuthenticatedApi()
  const pathname = usePathname()

  // 드로어 열릴 때 body 스크롤 잠그기
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  // ESC 키로 닫기
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  const role = user?.userRole
  const roleBadgeStyle = role ? ROLE_BADGE_STYLE[role] ?? 'bg-gray-100 text-gray-700' : null

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 pc:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* 배경 딤 */}
          <button
            type="button"
            aria-label="메뉴 닫기"
            onClick={onClose}
            className="absolute inset-0 bg-black/50"
          />

          {/* 드로어 본체 */}
          <motion.aside
            className="absolute right-0 top-0 flex h-full w-[242px] flex-col bg-[#1e1e1e] px-6 pt-4 pb-8 shadow-[0_0_8px_0_rgba(250,250,250,0.25)]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            role="dialog"
            aria-modal="true"
            aria-label="메뉴"
          >
            {/* 닫기 버튼 — 우측 시트의 좌측 상단 (오른쪽 화살표로 시트가 다시 닫힘을 표현) */}
            <button
              type="button"
              onClick={onClose}
              aria-label="메뉴 닫기"
              className="-ml-4 flex size-6 items-center justify-center text-white transition-opacity hover:opacity-70"
            >
              <ChevronRight size={24} strokeWidth={2} />
            </button>

            {/* 프로필 */}
            <div className="mt-8 flex items-center gap-4">
              <div className="size-16 shrink-0 overflow-hidden rounded-full bg-gray-100">
                {user?.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.image}
                    alt={user?.name ?? '프로필'}
                    className="size-full object-cover"
                  />
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex items-center gap-2">
                  <p className="truncate typo-m-s2 text-white">
                    {user?.name ?? '게스트'}
                  </p>
                  {role && roleBadgeStyle && (
                    <span
                      className={cn(
                        'inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-[800px] px-3 py-1 typo-c2',
                        roleBadgeStyle
                      )}
                    >
                      {role}
                    </span>
                  )}
                </div>
                <div className="flex flex-col typo-m-c1 text-white">
                  {user?.team && <p className="truncate">{user.team}</p>}
                  {user?.email && <p className="truncate">{user.email}</p>}
                </div>
              </div>
            </div>

            {/* 메뉴 목록 */}
            <nav className="mt-10 flex flex-col gap-6">
              {menus.map((menu) => {
                const active = Boolean(menu.href && pathname?.startsWith(menu.href))
                const itemClass = cn(
                  'text-left text-white transition-opacity hover:opacity-80',
                  active ? 'typo-m-s2' : 'typo-m-b2'
                )
                if (menu.href) {
                  return (
                    <Link
                      key={menu.label}
                      href={menu.href}
                      onClick={onClose}
                      className={itemClass}
                    >
                      {menu.label}
                    </Link>
                  )
                }
                return (
                  <button
                    key={menu.label}
                    type="button"
                    onClick={() => {
                      menu.onClick?.()
                      onClose()
                    }}
                    className={itemClass}
                  >
                    {menu.label}
                  </button>
                )
              })}
            </nav>

            {/* 로그아웃 — 메뉴 아래, 위쪽 정렬 (Figma도 메뉴 바로 아래에 붙어있음) */}
            <button
              type="button"
              onClick={() => {
                void handleLogout()
                onClose()
              }}
              className="mt-6 flex items-center gap-2 self-start text-white transition-opacity hover:opacity-70"
            >
              <LogOut size={24} strokeWidth={2} />
              <span className="typo-m-b2">로그아웃</span>
            </button>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
