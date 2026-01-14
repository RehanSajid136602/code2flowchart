'use client';

import React, { useMemo, useState } from 'react';
import { Mail, Lock, User, LogIn, LogOut, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  logout,
  resetPassword,
  resendVerificationEmail,
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
} from '@/lib/authActions';
import { getAuthErrorMessage } from '@/lib/authErrorHandler';

export default function AuthPanel() {
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isVerified = useMemo(() => {
    // Google sign-ins are usually verified; email/password requires verification.
    return !!user?.emailVerified;
  }, [user]);

  const handle = async (fn: () => Promise<any>) => {
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      await fn();
    } catch (e: any) {
      const userMessage = getAuthErrorMessage(e);
      setError(userMessage);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="text-xs text-slate-400 flex items-center gap-2">
        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Loading auth…
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-xs text-slate-300">
          <div className="font-semibold truncate max-w-[220px]">
            {user.displayName || user.email}
          </div>
          <div className="text-[10px] text-slate-500">
            {user.email} • {isVerified ? 'Verified' : 'Not verified'}
          </div>
        </div>

        {!isVerified && (
          <button
            onClick={() =>
              handle(async () => {
                await resendVerificationEmail();
                setMessage('Verification email sent.');
              })
            }
            disabled={busy}
            className="px-3 py-1.5 text-xs bg-amber-600/20 text-amber-300 border border-amber-600/30 hover:bg-amber-600/30 rounded-lg disabled:opacity-50"
            title="Resend email verification"
          >
            Resend verify
          </button>
        )}

        <button
          onClick={() => handle(logout)}
          disabled={busy}
          className="px-3 py-1.5 text-xs bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 rounded-lg disabled:opacity-50 flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>

        {message && <span className="text-[10px] text-emerald-400">{message}</span>}
        {error && <span className="text-[10px] text-red-400">{error}</span>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => handle(signInWithGoogle)}
        disabled={busy}
        className="px-3 py-1.5 text-xs bg-white text-black hover:bg-slate-100 rounded-lg disabled:opacity-50"
      >
        Continue with Google
      </button>

      <div className="hidden md:flex items-center gap-2 bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2">
        {mode === 'signup' && (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-500" />
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Name"
              className="bg-transparent outline-none text-xs text-slate-200 placeholder:text-slate-600 w-[110px]"
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-slate-500" />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="bg-transparent outline-none text-xs text-slate-200 placeholder:text-slate-600 w-[170px]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-slate-500" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="bg-transparent outline-none text-xs text-slate-200 placeholder:text-slate-600 w-[140px]"
          />
        </div>

        <button
          onClick={() =>
            handle(async () => {
              if (mode === 'signup') {
                await signUpWithEmail({ email, password, displayName });
                setMessage('Account created. Check your email to verify.');
              } else {
                await signInWithEmail({ email, password });
              }
            })
          }
          disabled={busy || !email || !password}
          className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 rounded-lg text-white disabled:opacity-50 flex items-center gap-2"
        >
          <LogIn className="w-4 h-4" /> {mode === 'signup' ? 'Sign up' : 'Sign in'}
        </button>

        <button
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          className="px-2 py-1.5 text-[10px] text-slate-400 hover:text-white"
          type="button"
        >
          {mode === 'signin' ? 'Create account' : 'Have account?'}
        </button>

        <button
          onClick={() =>
            handle(async () => {
              if (!email) throw new Error('Enter your email first');
              await resetPassword(email);
              setMessage('Password reset email sent.');
            })
          }
          className="px-2 py-1.5 text-[10px] text-slate-400 hover:text-white"
          type="button"
        >
          Forgot?
        </button>
      </div>

      {message && <span className="text-[10px] text-emerald-400">{message}</span>}
      {error && <span className="text-[10px] text-red-400">{error}</span>}
    </div>
  );
}
