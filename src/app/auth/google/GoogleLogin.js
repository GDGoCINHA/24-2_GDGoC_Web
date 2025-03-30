const clientId = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_CLIENT_ID;
const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;
const googleLoginUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email profile`;

export const GoogleLogin = () => {
  const handleGoogleLogin = () => {
    window.location.href = googleLoginUrl;
  };

  return {handleGoogleLogin};
};