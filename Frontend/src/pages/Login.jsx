import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import GoogleLoginButton from '@/components/auth/GoogleLoginButton';
import BrandLogo from '@/components/ui/BrandLogo';

export default function Login() {
  const navigate = useNavigate();
  const { loginWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailLogin = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await loginWithEmail(email, password);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error || 'Login failed');
      return;
    }

    const targetPath = result.user.role === 'admin' ? '/dashboard/admin' : '/dashboard/user';
    navigate(targetPath, { replace: true });
  };

  return (
    <div className="app-page flex items-center justify-center">
      <div className="w-full max-w-md p-4">
        <div className="app-card space-y-8">
          <div className="text-center space-y-2">
            <BrandLogo to="/" size="lg" className="justify-center" />
            <p className="app-subheading">Cloud Cost Optimizer</p>
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-pixel mb-2">Sign In</h2>
              <p className="app-subheading">Use email/password or Google account</p>
            </div>

            {error && (
              <div className="p-3 bg-pixel-coral text-pixel-darker border-2 border-pixel-coral font-pixel text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleEmailLogin} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="app-input"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="app-input"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="app-btn-primary"
              >
                {isSubmitting ? 'Signing In...' : 'Sign In with Email'}
              </button>
            </form>

            <GoogleLoginButton mode="login" />

            <div className="text-center space-y-2">
              <p className="font-pixel text-sm">Don't have an account?</p>
              <Link
                to="/signup"
                className="app-link-btn"
              >
                Sign Up
              </Link>
            </div>
          </div>

          <div className="border-t border-pixel-teal pt-4 text-center">
            <Link to="/" className="text-sm font-pixel text-pixel-coral hover:opacity-80 transition">
              {'<- Back to Home'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
