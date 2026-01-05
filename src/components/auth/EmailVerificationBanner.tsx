'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { resendVerificationEmail } from '@/lib/authActions';

export default function EmailVerificationBanner() {
  const { user, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shouldShow = useMemo(() => {
    if (loading) return false;
    if (!user) return false;
    if (!user.email) return false;
    return !user.emailVerified;
  }, [user, loading]);

  // After sending, poll for verification to auto-hide banner when the user verifies
  useEffect(() => {
    if (!sent) return;
    let cancelled = false;
    let attempts = 0;

    async function poll() {
      try {
        const { getFirebaseAuth } = await import('@/lib/firebase');
        const auth = getFirebaseAuth();
        const { reload } = await import('firebase/auth');
        if (auth?.currentUser) {
          await reload(auth.currentUser);
        }
      } catch {}
      attempts++;
      if (!cancelled && attempts < 24) {
        setTimeout(poll, 2500); // try for ~1 minute
      }
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [sent]);

  if (!shouldShow) return null;

  const handleResend = async () => {
    setBusy(true);
    setError(null);
    try {
      await resendVerificationEmail();
      setSent(true);
    } catch (e: any) {
      setError(e?.message || 'Failed to send verification email');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full bg-amber-500/10 border-b border-amber-500/30 text-amber-200">
      <div className="h-10 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <AlertTriangle className="w-4 h-4" />
          <span>
            Your email is not verified. Some features may be limited.
          </span>
          {sent && (
            <span className="text-[10px] text-emerald-300">
              Verification email sent. Check inbox/spam. This banner will hide once verified.
            </span>
          )}
          {error && <span className="text-[10px] text-red-300">{error}</span>}
        </div>

        <button
          onClick={handleResend}
          disabled={busy}
          className="px-3 py-1.5 text-xs bg-amber-600/20 border border-amber-600/30 hover:bg-amber-600/30 rounded-lg disabled:opacity-50 flex items-center gap-2"
        >
          {busy ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
          Resend verification
        </button>
      </div>
    </div>
  );
}
