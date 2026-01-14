import React, { Suspense } from 'react';
import SignupRedirect from './SignupRedirect';

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505] flex items-center justify-center text-slate-400">Loading…</div>}>
      <SignupRedirect />
    </Suspense>
  );
}
