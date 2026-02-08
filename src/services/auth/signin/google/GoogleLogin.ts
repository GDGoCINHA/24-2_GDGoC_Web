const clientId = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_CLIENT_ID;
const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;
const googleLoginBaseUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email profile`;

interface GoogleLoginOptions {
  next?: string;
}

const buildGoogleLoginUrl = (nextPath?: string) => {
  if (!nextPath || typeof nextPath !== 'string') {
    return googleLoginBaseUrl;
  }

  const trimmed = nextPath.trim();
  if (!trimmed.startsWith('/')) {
    return googleLoginBaseUrl;
  }

  const stateParam = encodeURIComponent(trimmed);
  return `${googleLoginBaseUrl}&state=${stateParam}`;
};

export const GoogleLogin = () => {
  const handleGoogleLogin = ({ next }: GoogleLoginOptions = {}) => {
    window.location.href = buildGoogleLoginUrl(next);
  };

  return {handleGoogleLogin};
};
