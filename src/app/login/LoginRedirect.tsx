'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const next = searchParams.get('next');
    router.replace(next ? `/auth?mode=signin&next=${encodeURIComponent(next)}` : '/auth?mode=signin');
  }, [router, searchParams]);

  return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-slate-400">Redirecting…</div>;
}
