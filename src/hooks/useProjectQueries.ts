import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Project, ProjectVersion } from '@/types'

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any)?.error ?? 'API request failed')
  }
  return res.json()
}

export function useProjects(userId: string | null, options?: { limit?: number; cursor?: number }) {
  return useQuery({
    queryKey: ['projects', userId, options],
    queryFn: () => {
      if (!userId) return Promise.reject(new Error('userId is required'))
      const url = new URL('/api/projects', location.origin)
      url.searchParams.set('userId', userId)
      if (options?.limit) url.searchParams.set('limit', String(options.limit))
      if (options?.cursor) url.searchParams.set('cursor', String(options.cursor))
      return fetchApi<{ projects: Project[]; nextCursor?: number }>(url.toString())
    },
    enabled: !!userId,
  })
}

export function useProject(userId: string | null, projectId: string | null) {
  return useQuery({
    queryKey: ['project', userId, projectId],
    queryFn: () => {
      if (!userId || !projectId) return Promise.reject(new Error('userId and projectId are required'))
      const url = new URL(`/api/projects/${projectId}`, location.origin)
      url.searchParams.set('userId', userId)
      return fetchApi<Project>(url.toString())
    },
    enabled: !!userId && !!projectId,
  })
}

export function useProjectHistory(userId: string | null, projectId: string | null) {
  return useQuery({
    queryKey: ['projectHistory', userId, projectId],
    queryFn: () => {
      if (!userId || !projectId) return Promise.reject(new Error('userId and projectId are required'))
      const url = new URL(`/api/projects/${projectId}/history`, location.origin)
      url.searchParams.set('userId', userId)
      return fetchApi<{ history: any[] }>(url.toString())
    },
    enabled: !!userId && !!projectId,
  })
}

export function useProjectVersions(userId: string | null, projectId: string | null, options?: { limit?: number }) {
  return useQuery({
    queryKey: ['projectVersions', userId, projectId, options],
    queryFn: () => {
      if (!userId || !projectId) return Promise.reject(new Error('userId and projectId are required'))
      const url = new URL(`/api/projects/${projectId}/versions`, location.origin)
      url.searchParams.set('userId', userId)
      if (options?.limit) url.searchParams.set('limit', String(options.limit))
      return fetchApi<{ versions: ProjectVersion[] }>(url.toString())
    },
    enabled: !!userId && !!projectId,
  })
}

export function useBackupMetadata(userId: string | null) {
  return useQuery({
    queryKey: ['backupMetadata', userId],
    queryFn: () => {
      if (!userId) return Promise.reject(new Error('userId is required'))
      const url = new URL('/api/backup', location.origin)
      url.searchParams.set('userId', userId)
      url.searchParams.set('metadata', 'true')
      return fetchApi<{ projectCount: number; lastUpdated: number }>(url.toString())
    },
    enabled: !!userId,
  })
}

export function useSaveProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, project }: { userId: string; project: Omit<Project, 'updatedAt'> }) => {
      return fetchApi<Project>('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, project }),
      })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects', variables.userId] })
      queryClient.invalidateQueries({ queryKey: ['project', variables.userId, variables.project.id] })
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, projectId, updates }: { userId: string; projectId: string; updates: Partial<Project> }) => {
      const url = new URL(`/api/projects/${projectId}`, location.origin)
      url.searchParams.set('userId', userId)
      return fetchApi<Project>(url.toString(), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects', variables.userId] })
      queryClient.invalidateQueries({ queryKey: ['project', variables.userId, variables.projectId] })
      queryClient.invalidateQueries({ queryKey: ['projectHistory', variables.userId, variables.projectId] })
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, projectId, hard }: { userId: string; projectId: string; hard?: boolean }) => {
      const url = new URL(`/api/projects/${projectId}`, location.origin)
      url.searchParams.set('userId', userId)
      if (hard) url.searchParams.set('hard', 'true')
      return fetchApi<any>(url.toString(), { method: 'DELETE' })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects', variables.userId] })
      queryClient.invalidateQueries({ queryKey: ['project', variables.userId, variables.projectId] })
    },
  })
}

export function useRestoreProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, projectId }: { userId: string; projectId: string }) => {
      const url = new URL(`/api/projects/${projectId}`, location.origin)
      url.searchParams.set('userId', userId)
      return fetchApi<Project>(url.toString(), { method: 'POST' })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects', variables.userId] })
      queryClient.invalidateQueries({ queryKey: ['project', variables.userId, variables.projectId] })
      queryClient.invalidateQueries({ queryKey: ['projectHistory', variables.userId, variables.projectId] })
    },
  })
}

export function useCreateVersion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, projectId, description }: { userId: string; projectId: string; description?: string }) => {
      const url = new URL(`/api/projects/${projectId}/versions`, location.origin)
      url.searchParams.set('userId', userId)
      return fetchApi<ProjectVersion>(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projectVersions', variables.userId, variables.projectId] })
      queryClient.invalidateQueries({ queryKey: ['projectHistory', variables.userId, variables.projectId] })
    },
  })
}

export function useRestoreVersion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, projectId, versionId }: { userId: string; projectId: string; versionId: string }) => {
      const url = new URL(`/api/projects/${projectId}/versions/${versionId}/restore`, location.origin)
      url.searchParams.set('userId', userId)
      return fetchApi<Project>(url.toString(), { method: 'POST' })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects', variables.userId] })
      queryClient.invalidateQueries({ queryKey: ['project', variables.userId, variables.projectId] })
      queryClient.invalidateQueries({ queryKey: ['projectHistory', variables.userId, variables.projectId] })
      queryClient.invalidateQueries({ queryKey: ['projectVersions', variables.userId, variables.projectId] })
    },
  })
}

export function useDeleteVersion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, projectId, versionId }: { userId: string; projectId: string; versionId: string }) => {
      const url = new URL(`/api/projects/${projectId}/versions/${versionId}`, location.origin)
      url.searchParams.set('userId', userId)
      return fetchApi<any>(url.toString(), { method: 'DELETE' })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projectVersions', variables.userId, variables.projectId] })
    },
  })
}

export function useExportUserData() {
  return useMutation({
    mutationFn: (userId: string) => {
      const url = new URL('/api/backup', location.origin)
      url.searchParams.set('userId', userId)
      url.searchParams.set('format', 'blob')
      return fetchApi<Blob>(url.toString())
    },
  })
}

export function useImportUserData() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, data, options }: { userId: string; data: Blob | string; options?: { onConflict?: 'rename' | 'skip' | 'overwrite' } }) => {
      const url = new URL('/api/backup/import', location.origin)
      url.searchParams.set('userId', userId)
      if (options?.onConflict) url.searchParams.set('onConflict', options.onConflict)

      const isBlob = data instanceof Blob
      return fetchApi<{ imported: number; skipped: number; errors: string[] }>(url.toString(), {
        method: 'POST',
        headers: isBlob ? {} : { 'Content-Type': 'application/json' },
        body: isBlob ? data : JSON.stringify(data),
      })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects', variables.userId] })
      queryClient.invalidateQueries({ queryKey: ['backupMetadata', variables.userId] })
    },
  })
}
