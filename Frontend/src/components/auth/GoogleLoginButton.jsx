import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import PixelLoader from '@/components/ui/PixelLoader';

export default function GoogleLoginButton({
  mode = 'login',
  onSuccess,
  onError,
}) {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const googleClientId = String(import.meta.env.VITE_GOOGLE_CLIENT_ID || '')
    .trim()
    .replace(/^['"]|['"]$/g, '');

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setError(null);

    try {
      const authFn = mode === 'signup' ? signup : login;
      const result = await authFn(credentialResponse.credential);

      if (result.success) {
        if (onSuccess) {
          onSuccess(result.user);
        } else {
          const targetPath =
            result.user.role === 'admin' ? '/dashboard/admin' : '/dashboard/user';
          navigate(targetPath, { replace: true });
        }
      } else {
        setError(result.error || 'Login failed');
        if (onError) {
          onError(result.error);
        }
      }
    } catch (err) {
      setError('An error occurred during login');
      if (onError) {
        onError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed');
    if (onError) {
      onError('Google login failed');
    }
  };

  return (
    <div className="space-y-4">
      {!googleClientId && (
        <div className="p-3 bg-pixel-coral text-pixel-darker border-2 border-pixel-coral font-pixel text-xs">
          Google login is not configured for this environment.
        </div>
      )}

      {error && (
        <div className="p-4 bg-pixel-coral text-pixel-darker border-2 border-pixel-coral font-pixel text-sm">
          {error}
        </div>
      )}

      {googleClientId && (
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            text={mode === 'signup' ? 'signup_with' : 'signin_with'}
            theme="outline"
            width="300"
          />
        </div>
      )}

      {isLoading && (
        <PixelLoader message={mode === 'signup' ? 'Creating account...' : 'Logging in...'} />
      )}
    </div>
  );
}
