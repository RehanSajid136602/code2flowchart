'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { History as HistoryIcon, Clock, FileText, Trash2, RefreshCw, Search } from 'lucide-react'
import { useProjectHistory } from '@/hooks/useProjectQueries'
import type { ProjectHistory } from '@/types'

export default function HistoryPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [user, loading, router])

  const { data: historyData } = useProjectHistory(user?.uid ?? null, selectedProjectId ?? null)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-2xl">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }
}
