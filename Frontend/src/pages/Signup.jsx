import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import GoogleLoginButton from '@/components/auth/GoogleLoginButton';
import BrandLogo from '@/components/ui/BrandLogo';

export default function Signup() {
  const navigate = useNavigate();
  const { signupWithEmail } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailSignup = async (event) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    const result = await signupWithEmail({
      name,
      email,
      password,
    });
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error || 'Registration failed');
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
              <h2 className="text-2xl font-pixel mb-2">Create Account</h2>
              <p className="app-subheading">Register with email/password or Google</p>
            </div>

            {error && (
              <div className="p-3 bg-pixel-coral text-pixel-darker border-2 border-pixel-coral font-pixel text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleEmailSignup} className="space-y-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                required
                className="app-input"
              />
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
                placeholder="Password (min 8 chars)"
                required
                minLength={8}
                className="app-input"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                required
                minLength={8}
                className="app-input"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="app-btn-primary"
              >
                {isSubmitting ? 'Creating Account...' : 'Sign Up with Email'}
              </button>
            </form>

            <GoogleLoginButton mode="signup" />

            <div className="text-center space-y-2">
              <p className="font-pixel text-sm">Already have an account?</p>
              <Link
                to="/login"
                className="app-link-btn"
              >
                Sign In
              </Link>
            </div>
          </div>

          <div className="border-t border-pixel-teal pt-4 text-center">
            <Link to="/" className="text-sm font-pixel text-pixel-teal hover:opacity-80 transition">
              {'<- Back to Home'}
            </Link>
          </div>

          <div className="text-center text-xs font-pixel opacity-60">
            <p>By signing up, you agree to our Terms of Service</p>
          </div>
        </div>
      </div>
    </div>
  );
}
