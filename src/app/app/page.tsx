'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type ReactNode, useEffect, useState } from 'react'

import { DUSK_SUBMIT_BUTTON } from '@/components/ui/dusk/DuskForm'
import { cn } from '@/utils/cn'

/** 표준 DOM 타입에 없다 (크롬 계열 전용). */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type InstallWindow = Window & { __gdgInstallPrompt?: BeforeInstallPromptEvent }

type Env = 'standalone' | 'kakao' | 'ios' | 'android' | 'desktop'

function detectEnv(): Env {
  const ua = navigator.userAgent
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  if (standalone) return 'standalone'
  // 카톡 안 브라우저에서는 홈 화면 추가가 안 된다. 링크가 대부분 단톡방으로 퍼지므로 먼저 거른다.
  if (/KAKAOTALK/i.test(ua)) return 'kakao'
  // iPadOS 는 데스크톱 Safari UA 를 쓰므로 터치 지원으로 가른다
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1))
    return 'ios'
  if (/Android/i.test(ua)) return 'android'
  return 'desktop'
}

function openInExternalBrowser() {
  window.location.href = `kakaotalk://web/openExternal?url=${encodeURIComponent(window.location.href)}`
}

export default function AppInstallPage() {
  const router = useRouter()
  const [env, setEnv] = useState<Env | null>(null)
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const detected = detectEnv()
    if (detected === 'standalone') {
      router.replace('/')
      return
    }
    setEnv(detected)

    const w = window as InstallWindow
    if (w.__gdgInstallPrompt) setPromptEvent(w.__gdgInstallPrompt)

    // 사이트 안에서 이동해 들어오면 레이아웃의 인라인 스크립트가 돌지 않는다
    const onPrompt = (e: Event) => {
      e.preventDefault()
      w.__gdgInstallPrompt = e as BeforeInstallPromptEvent
      setPromptEvent(e as BeforeInstallPromptEvent)
    }
    const onInstalled = () => setInstalled(true)
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [router])

  const install = async () => {
    if (!promptEvent) return
    await promptEvent.prompt()
    const { outcome } = await promptEvent.userChoice
    // prompt() 는 이벤트마다 한 번만 부를 수 있다
    ;(window as InstallWindow).__gdgInstallPrompt = undefined
    setPromptEvent(null)
    if (outcome === 'accepted') setInstalled(true)
  }

  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-[440px] flex-col px-5 pb-10 pt-6">
      <Link
        href="/"
        className="-mx-2 inline-flex min-h-11 items-center self-start px-2 text-sm text-dusk-ink-300 transition-colors hover:text-dusk-ink-100"
      >
        ← 홈페이지로
      </Link>

      <div className="mt-8 flex flex-col items-center text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/app/icon-192.png"
          alt=""
          width={80}
          height={80}
          className="size-20 rounded-[20px] border border-dusk-line shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
        />
        <h1 className="mt-5 break-keep text-[24px] font-semibold leading-[1.35] tracking-[-0.03em]">
          GDGoC INHA를 앱처럼
        </h1>
        <p className="mt-2 break-keep text-[15px] leading-[1.7] text-dusk-ink-600">
          홈 화면에 추가하면 주소창 없이 아이콘 한 번으로 열려요.
        </p>
      </div>

      <section className="mt-9">
        {installed ? (
          <Card>
            <p className="text-[16px] font-medium">설치됐어요 🎉</p>
            <p className="mt-1.5 text-[14px] leading-[1.7] text-dusk-ink-600">
              이제 홈 화면의 <b className="text-dusk-ink-200">GDGoC INHA</b> 아이콘으로 열어 주세요.
            </p>
          </Card>
        ) : env === 'kakao' ? (
          <Card>
            <p className="text-[16px] font-medium">카카오톡에서는 설치할 수 없어요</p>
            <p className="mt-1.5 text-[14px] leading-[1.7] text-dusk-ink-600">
              Safari나 Chrome으로 이 페이지를 다시 열면 설치 방법이 나와요.
            </p>
            <button
              type="button"
              onClick={openInExternalBrowser}
              className={cn(DUSK_SUBMIT_BUTTON, 'mt-5 w-full')}
            >
              다른 브라우저로 열기
            </button>
            <p className="mt-3 text-[13px] leading-[1.6] text-dusk-ink-700">
              안 열리면 화면 구석의 ⋮ 또는 ⋯ 메뉴에서 「다른 브라우저로 열기」를 눌러 주세요.
            </p>
          </Card>
        ) : env === 'ios' ? (
          <Card>
            <ol className="flex flex-col gap-5">
              <Step n={1} icon={<ShareIcon />}>
                <b className="text-dusk-ink-100">공유 버튼</b>을 눌러 주세요. 주소창 옆이나 화면
                아래에 있어요.
                <span className="mt-1 block text-[13px] text-dusk-ink-700">
                  안 보이면 「⋯」를 먼저 누르세요.
                </span>
              </Step>
              <Step n={2} icon={<AddIcon />}>
                목록을 내려 <b className="text-dusk-ink-100">「홈 화면에 추가」</b>를 눌러 주세요.
              </Step>
              <Step n={3}>
                오른쪽 위 <b className="text-dusk-ink-100">「추가」</b>를 누르면 끝이에요.
                <span className="mt-1 block text-[13px] text-dusk-ink-700">
                  「웹 앱으로 열기」가 보이면 켜 두세요.
                </span>
              </Step>
            </ol>
            <p className="mt-6 border-t border-dusk-line pt-4 text-[13px] leading-[1.6] text-dusk-ink-700">
              앱에서는 처음 한 번 다시 로그인해야 해요.
            </p>
          </Card>
        ) : env === 'android' || env === 'desktop' ? (
          promptEvent ? (
            <button type="button" onClick={install} className={cn(DUSK_SUBMIT_BUTTON, 'w-full')}>
              앱 설치하기
            </button>
          ) : env === 'android' ? (
            <Card>
              <p className="text-[14px] leading-[1.7] text-dusk-ink-600">
                브라우저 메뉴(⋮)에서 <b className="text-dusk-ink-100">「앱 설치」</b> 또는{' '}
                <b className="text-dusk-ink-100">「홈 화면에 추가」</b>를 눌러 주세요.
              </p>
              <p className="mt-3 text-[13px] leading-[1.6] text-dusk-ink-700">
                메뉴에 없다면 이미 설치돼 있을 수 있어요. 홈 화면을 확인해 보세요.
              </p>
            </Card>
          ) : (
            <Card>
              <p className="text-[14px] leading-[1.7] text-dusk-ink-600">
                휴대폰에서 <b className="text-dusk-ink-100">gdgocinha.com/app</b>을 열어 주세요.
              </p>
            </Card>
          )
        ) : null}
      </section>
    </main>
  )
}

function Card({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dusk-line bg-[rgba(240,234,228,0.04)] px-5 py-5">
      {children}
    </div>
  )
}

function Step({ n, icon, children }: { n: number; icon?: ReactNode; children: ReactNode }) {
  return (
    <li className="flex gap-3.5">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ember text-[13px] font-semibold text-ember-ink">
        {n}
      </span>
      <div className="min-w-0 flex-1 break-keep text-[15px] leading-[1.7] text-dusk-ink-500">
        {children}
        {icon && <span className="mt-2 flex text-dusk-ink-300">{icon}</span>}
      </div>
    </li>
  )
}

function ShareIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
    >
      <path d="M12 3v12M8 7l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M8 10H6.5A1.5 1.5 0 0 0 5 11.5v8A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5v-8a1.5 1.5 0 0 0-1.5-1.5H16"
        strokeLinecap="round"
      />
    </svg>
  )
}

function AddIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
    >
      <rect x="4" y="4" width="16" height="16" rx="3.5" />
      <path d="M12 8.5v7M8.5 12h7" strokeLinecap="round" />
    </svg>
  )
}
