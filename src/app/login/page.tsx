import React, { Suspense } from 'react';
import LoginClient from './LoginClient';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505] flex items-center justify-center text-slate-400">Loading…</div>}>
      <LoginClient />
    </Suspense>
  );
}
