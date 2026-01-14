'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { RefreshCw, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { resetPassword, signInWithEmail, signInWithGoogle } from '@/lib/authActions';
import { getAuthErrorMessage } from '@/lib/authErrorHandler';
import AuthBackground from '@/components/auth/AuthBackground';
import '@/styles/auth.css';

export default function LoginClient() {
  const router = useRouter();
  const search = useSearchParams();
  const nextUrl = search.get('next') || '/';

  const { user, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => email.length > 3 && password.length >= 6, [email, password]);

  React.useEffect(() => {
    if (!loading && user) router.replace(nextUrl);
  }, [loading, user, router, nextUrl]);

  const handle = async (fn: () => Promise<any>) => {
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      const result = await fn();
      if (result || user) {
        router.replace(nextUrl);
      }
    } catch (e: any) {
      const userMessage = getAuthErrorMessage(e);
      setError(userMessage);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-body login-page">
      <AuthBackground />

      <div className="auth-container">
        <nav className="auth-tab-nav">
          <Link href="/login" className="auth-tab-btn active">Sign In</Link>
          <Link href="/signup" className="auth-tab-btn">Sign Up</Link>
          <div className="auth-tab-slider" />
        </nav>

        <form className="auth-form" onSubmit={(e) => { e.preventDefault(); handle(() => signInWithEmail({ email, password })); }}>
          <div className="auth-form-header">
            <h2>Welcome <span className="auth-accent-text">Back</span></h2>
            <p>Enter your credentials to access your account</p>
          </div>

          {error && (
            <div className="auth-alert auth-alert-error">
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="auth-alert auth-alert-success">
              <span>{message}</span>
            </div>
          )}

          <div className="auth-input-group">
            <label>Email Address</label>
            <div className="auth-input-wrapper">
              <Mail className="auth-icon" size={18} />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <div className="auth-input-glow"></div>
            </div>
          </div>

          <div className="auth-input-group">
            <label>Password</label>
            <div className="auth-input-wrapper">
              <Lock className="auth-icon" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="auth-input-glow"></div>
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="auth-options">
            <span />
            <button
              type="button"
              className="auth-forgot-link"
              onClick={async () => {
                if (!email) { setError('Please enter your email first'); return; }
                handle(() => resetPassword(email)).then(() => setMessage('Reset email sent!'));
              }}
            >
              Forgot password?
            </button>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={busy || !canSubmit}>
            {busy ? <RefreshCw className="animate-spin" size={20} /> : 'Sign In'}
          </button>

          <div className="auth-divider">
            <span>or continue with</span>
          </div>

          <div className="auth-social-login">
            <button type="button" className="auth-social-btn" onClick={() => handle(signInWithGoogle)} disabled={busy}>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
          </div>

          <div className="guest-btn-container">
            <button type="button" className="guest-link-btn" onClick={() => router.push('/')}>
              Continue as guest
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
