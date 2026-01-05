'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function AuthGate({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center text-sm text-slate-400">
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      fallback || (
        <div className="h-full w-full flex items-center justify-center text-sm text-slate-300">
          Please sign in to use LogicFlow AI.
        </div>
      )
    );
  }

  return <>{children}</>;
}
