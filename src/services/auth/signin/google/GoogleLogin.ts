const clientId = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_CLIENT_ID
const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI
const googleLoginBaseUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email profile`

interface GoogleLoginOptions {
  next?: string
}

const buildGoogleLoginUrl = (nextPath?: string) => {
  if (!nextPath || typeof nextPath !== 'string') {
    return googleLoginBaseUrl
  }

  const trimmed = nextPath.trim()
  let internalPath = trimmed

  if (typeof window !== 'undefined' && !trimmed.startsWith('/')) {
    try {
      const parsed = new URL(trimmed, window.location.origin)
      if (parsed.origin === window.location.origin) {
        internalPath = `${parsed.pathname}${parsed.search}${parsed.hash}`
      }
    } catch {
      return googleLoginBaseUrl
    }
  }

  if (!internalPath.startsWith('/') || internalPath.startsWith('//')) {
    return googleLoginBaseUrl
  }

  const stateParam = encodeURIComponent(internalPath)
  return `${googleLoginBaseUrl}&state=${stateParam}`
}

export const GoogleLogin = () => {
  const handleGoogleLogin = ({ next }: GoogleLoginOptions = {}) => {
    window.location.href = buildGoogleLoginUrl(next)
  }

  return { handleGoogleLogin }
}
