import React, { Suspense } from 'react'
import AuthClient from '@/components/auth/AuthClient'

export const metadata = {
  title: 'Sign In - Code Flowchart',
  description: 'Sign in to your account to save and manage your flowchart projects',
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505] flex items-center justify-center text-slate-400">Loading…</div>}>
      <AuthClient />
    </Suspense>
  )
}
