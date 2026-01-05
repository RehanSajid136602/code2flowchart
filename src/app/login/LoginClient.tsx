'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { resetPassword, signInWithEmail, signInWithGoogle } from '@/lib/authActions';

export default function LoginClient() {
  const router = useRouter();
  const search = useSearchParams();
  const nextUrl = search.get('next') || '/';

  const { user, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      // For social login, result will have a user if successful.
      // For email login/signup, the user state will also be updated.
      if (result || user) {
        router.replace(nextUrl);
      }
    } catch (e: any) {
      console.error('Auth Error:', e);
      if (e?.code === 'auth/popup-blocked') {
        setError('Popup was blocked by your browser. Please allow popups for this site.');
      } else {
        setError(e?.message || 'Authentication failed');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.18),transparent_55%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(16,185,129,0.14),transparent_55%)]" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-slate-950/60 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-7 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <span className="text-white font-black">LF</span>
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-100 tracking-tight">Welcome back</h1>
                <p className="text-sm text-slate-400">Sign in to continue to LogicFlow AI</p>
              </div>
            </div>
          </div>

          <div className="p-7 space-y-4">
            <button
              onClick={() => handle(signInWithGoogle)}
              disabled={busy}
              className="w-full h-11 rounded-xl bg-white text-black font-semibold hover:bg-slate-100 transition disabled:opacity-50"
            >
              Continue with Google
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-800" />
              <span className="text-[10px] uppercase tracking-widest text-slate-500">or</span>
              <div className="h-px flex-1 bg-slate-800" />
            </div>

            <div className="space-y-3">
              <label className="block">
                <span className="text-[10px] uppercase tracking-widest text-slate-500">Email</span>
                <div className="mt-2 flex items-center gap-2 bg-slate-900/60 border border-slate-800 rounded-xl px-3 h-11">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-transparent outline-none text-sm text-slate-200 placeholder:text-slate-600"
                    autoComplete="email"
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-[10px] uppercase tracking-widest text-slate-500">Password</span>
                <div className="mt-2 flex items-center gap-2 bg-slate-900/60 border border-slate-800 rounded-xl px-3 h-11">
                  <Lock className="w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent outline-none text-sm text-slate-200 placeholder:text-slate-600"
                    autoComplete="current-password"
                  />
                </div>
              </label>

              <button
                onClick={() => handle(() => signInWithEmail({ email, password }))}
                disabled={busy || !canSubmit}
                className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 transition text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {busy ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                Sign in
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={async () => {
                  setMessage(null);
                  setError(null);
                  try {
                    if (!email) throw new Error('Enter your email first');
                    setBusy(true);
                    await resetPassword(email);
                    setMessage('Password reset email sent.');
                  } catch (e: any) {
                    setError(e?.message || 'Failed to send reset email');
                  } finally {
                    setBusy(false);
                  }
                }}
                className="text-xs text-slate-400 hover:text-slate-200"
                type="button"
              >
                Forgot password?
              </button>

              <Link href={`/signup?next=${encodeURIComponent(nextUrl)}`} className="text-xs text-slate-300 hover:text-white">
                Create account
              </Link>
            </div>

            {message && <div className="text-xs text-emerald-400">{message}</div>}
            {error && <div className="text-xs text-red-400">{error}</div>}
          </div>

          <div className="px-7 pb-7">
            <div className="text-[10px] text-slate-500">
              By continuing you agree to your own Terms/Privacy (add links later).
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-[11px] text-slate-600">
          <Link href="/" className="hover:text-slate-300">Back to app</Link>
        </div>
      </div>
    </div>
  );
}
