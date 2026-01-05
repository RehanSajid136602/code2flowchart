'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { getProjectHistory } from '@/lib/projectActions'
import { History as HistoryIcon, Clock, FileText, Trash2, RefreshCw, Search, ArrowLeft } from 'lucide-react'

export default function HistoryPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return
      setIsLoading(true)
      try {
        const data = await getProjectHistory(user.uid, selectedProjectId ?? null)
        setHistory(data)
      } catch (error) {
        console.error('Failed to fetch history:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHistory()
  }, [user, selectedProjectId])

  const filteredHistory = history.filter(entry => {
    if (selectedProjectId && entry.projectId !== selectedProjectId) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        entry.action.toLowerCase().includes(query) ||
        entry.projectId.toLowerCase().includes(query)
      )
    }
    return true
  })

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return <FileText className="h-5 w-5" />
      case 'update':
        return <RefreshCw className="h-5 w-5" />
      case 'delete':
        return <Trash2 className="h-5 w-5" />
      case 'restore':
        return <RefreshCw className="h-5 w-5" />
      case 'version':
        return <Clock className="h-5 w-5" />
      default:
        return <HistoryIcon className="h-5 w-5" />
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'text-blue-400 bg-blue-400/10'
      case 'update':
        return 'text-yellow-400 bg-yellow-400/10'
      case 'delete':
        return 'text-red-400 bg-red-400/10'
      case 'restore':
        return 'text-green-400 bg-green-400/10'
      case 'version':
        return 'text-purple-400 bg-purple-400/10'
      default:
        return 'text-gray-400 bg-gray-400/10'
    }
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Activity History</h1>
              <p className="text-slate-400 text-lg">
                Track all your project changes, versions, and actions
              </p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-all"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Website
            </button>
          </div>
        </div>

        <div className="bg-slate-900/50 rounded-xl p-6 backdrop-blur-sm border border-slate-800 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <label className="text-sm text-slate-400 mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search history..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-800 text-white pl-10 pr-4 py-2.5 rounded-lg border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="text-sm text-slate-400 mb-2 block">Filter by Project</label>
              <select
                value={selectedProjectId ?? ''}
                onChange={(e) => setSelectedProjectId(e.target.value || null)}
                className="w-full bg-slate-800 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all cursor-pointer"
                disabled={isLoading}
              >
                <option value="">All Projects</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-pulse">
                <HistoryIcon className="h-8 w-8 text-slate-600" />
              </div>
              <p className="text-slate-400 mt-4">Loading history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="bg-slate-900/50 rounded-xl p-12 backdrop-blur-sm border border-slate-800 text-center">
              <HistoryIcon className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-300 mb-2">No history found</h3>
              <p className="text-slate-400 mb-6">
                {searchQuery
                  ? 'No results match your search'
                  : 'Start working on projects to see your history here'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-all"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            history.map((entry) => (
              <div
                key={entry.id}
                className="bg-slate-900/50 rounded-xl p-6 backdrop-blur-sm border border-slate-800 hover:border-slate-700 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${getActionColor(entry.action)} shrink-0`}>
                    {getActionIcon(entry.action)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-white font-medium capitalize">{entry.action}</span>
                        <span className="text-slate-400 mx-2">•</span>
                        <span className="text-slate-400 font-mono text-sm">{entry.projectId}</span>
                      </div>
                      <span className="text-slate-500 text-sm">{formatDate(entry.changedAt)}</span>
                    </div>
                    <p className="text-slate-300 text-sm">
                      {entry.action === 'create' && 'Created a new project'}
                      {entry.action === 'update' && 'Updated project'}
                      {entry.action === 'delete' && 'Deleted project'}
                      {entry.action === 'restore' && 'Restored deleted project'}
                      {entry.action === 'version' && 'Created a version snapshot'}
                    </p>
                    {entry.previousValues && (
                      <div className="mt-3 pt-3 border-t border-slate-800">
                        <p className="text-slate-400 text-xs">Previous state</p>
                        <div className="mt-2 text-slate-300 text-xs font-mono bg-slate-800/50 rounded p-2">
                          {entry.previousValues.name && <div>Name: {entry.previousValues.name}</div>}
                          {entry.previousValues.code && <div>Code length: {entry.previousValues.code.length} chars</div>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
