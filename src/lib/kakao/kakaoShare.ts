/**
 * 카카오톡 공유. 공식 JavaScript SDK 의 `Kakao.Share.sendDefault`(feed 템플릿)만 쓴다 — 단톡방 자동 발송은
 * 공식 API 가 없고, 기획서 2.10 도 자동 발송을 하지 않는다.
 *
 * SDK 는 버튼을 처음 누를 때 받는다. 페이지마다 미리 받으면 공유를 안 하는 사람도 비용을 낸다.
 *
 * 키(`NEXT_PUBLIC_KAKAO_JS_KEY`)는 정적 export 라 **빌드 시점에** 박힌다. 없으면 버튼을 비활성으로 둔다 —
 * PR 빌드(ci.yml)에는 시크릿이 없어 늘 비어 있다.
 */

const SDK_URL = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js'

/** 공유 카드에 쓸 그림이 없을 때. 사이트 OG 이미지와 같다. */
const FALLBACK_IMAGE = 'https://gdgocinha.com/screenshots/home.png'

interface KakaoLink {
  mobileWebUrl: string
  webUrl: string
}

interface KakaoSdk {
  isInitialized(): boolean
  init(key: string): void
  Share: {
    sendDefault(settings: {
      objectType: 'feed'
      content: { title: string; description?: string; imageUrl: string; link: KakaoLink }
      buttons?: { title: string; link: KakaoLink }[]
    }): void
  }
}

declare global {
  interface Window {
    Kakao?: KakaoSdk
  }
}

export const KAKAO_JS_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY ?? ''

let loading: Promise<KakaoSdk> | null = null

const loadSdk = (): Promise<KakaoSdk> => {
  if (window.Kakao) return Promise.resolve(window.Kakao)
  if (loading) return loading
  loading = new Promise<KakaoSdk>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SDK_URL
    script.async = true
    script.crossOrigin = 'anonymous'
    script.onload = () =>
      window.Kakao ? resolve(window.Kakao) : reject(new Error('카카오 SDK 를 불러오지 못했어요.'))
    script.onerror = () => {
      loading = null
      reject(new Error('카카오 SDK 를 불러오지 못했어요.'))
    }
    document.head.appendChild(script)
  })
  return loading
}

export interface KakaoShareContent {
  title: string
  description?: string
  imageUrl?: string | null
  /** 현재 도메인에 붙일 경로. 예: `/club/detail/?id=3` */
  path: string
}

export const shareToKakao = async ({ title, description, imageUrl, path }: KakaoShareContent) => {
  if (!KAKAO_JS_KEY) throw new Error('카카오톡 공유가 아직 설정되지 않았어요.')
  const kakao = await loadSdk()
  if (!kakao.isInitialized()) kakao.init(KAKAO_JS_KEY)
  // 도메인은 카카오 개발자 콘솔의 Web 플랫폼에 등록된 곳이어야 한다 (운영·개발·localhost).
  const url = new URL(path, window.location.origin).toString()
  const link = { mobileWebUrl: url, webUrl: url }
  kakao.Share.sendDefault({
    objectType: 'feed',
    content: { title, description, imageUrl: imageUrl || FALLBACK_IMAGE, link },
    buttons: [{ title: '바로가기', link }]
  })
}
