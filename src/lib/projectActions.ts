import { Project, ProjectVersion } from '@/types'

export async function saveProject(userId: string, project: Omit<Project, 'updatedAt'>) {
  const url = '/api/projects'
  const payload = { userId, project }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any)?.error ?? 'Failed to save project')
  }
  return (await res.json()) as Project
}

export async function getProjects(userId: string, limit?: number, cursor?: number): Promise<{ projects: Project[]; nextCursor?: number }> {
  const url = new URL('/api/projects', location.origin)
  url.searchParams.set('userId', userId)
  if (limit !== undefined) url.searchParams.set('limit', String(limit))
  if (cursor !== undefined && cursor !== null) url.searchParams.set('cursor', String(cursor))
  const res = await fetch(url.toString())
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any)?.error ?? 'Failed to fetch projects')
  }
  return (await res.json()) as any
}

export async function getProject(userId: string, projectId: string): Promise<Project> {
  const url = new URL(`/api/projects/${projectId}`, location.origin)
  url.searchParams.set('userId', userId)
  const res = await fetch(url.toString())
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any)?.error ?? 'Failed to fetch project')
  }
  return (await res.json()) as Project
}

export async function updateProject(userId: string, projectId: string, updates: Partial<Project>): Promise<Project> {
  const url = new URL(`/api/projects/${projectId}`, location.origin)
  url.searchParams.set('userId', userId)
  const res = await fetch(url.toString(), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any)?.error ?? 'Failed to update project')
  }
  return (await res.json()) as Project
}

export async function deleteProject(userId: string, projectId: string, hard?: boolean) {
  const url = new URL(`/api/projects/${projectId}`, location.origin)
  url.searchParams.set('userId', userId)
  if (hard) url.searchParams.set('hard', 'true')
  const res = await fetch(url.toString(), { method: 'DELETE' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any)?.error ?? 'Failed to delete project')
  }
  return (await res.json()) as any
}

export async function restoreProject(userId: string, projectId: string): Promise<Project> {
  const url = new URL(`/api/projects/${projectId}`, location.origin)
  url.searchParams.set('userId', userId)
  const res = await fetch(url.toString(), { method: 'POST' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any)?.error ?? 'Failed to restore project')
  }
  return (await res.json()) as Project
}

export async function getProjectHistory(userId: string, projectId: string): Promise<any[]> {
  const url = new URL(`/api/projects/${projectId}/history`, location.origin)
  url.searchParams.set('userId', userId)
  const res = await fetch(url.toString())
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any)?.error ?? 'Failed to fetch project history')
  }
  const data = await res.json()
  return data.history as any[]
}

export async function exportUserData(userId: string): Promise<Blob> {
  const url = new URL('/api/backup', location.origin)
  url.searchParams.set('userId', userId)
  url.searchParams.set('format', 'blob')
  const res = await fetch(url.toString())
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any)?.error ?? 'Failed to export user data')
  }
  return res.blob()
}

export async function getBackupMetadata(userId: string): Promise<{ projectCount: number; lastUpdated: number }> {
  const url = new URL('/api/backup', location.origin)
  url.searchParams.set('userId', userId)
  url.searchParams.set('metadata', 'true')
  const res = await fetch(url.toString())
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any)?.error ?? 'Failed to fetch backup metadata')
  }
  return (await res.json()) as { projectCount: number; lastUpdated: number }
}

export async function importUserData(userId: string, data: Blob | string, options?: { onConflict?: 'rename' | 'skip' | 'overwrite' }): Promise<{ imported: number; skipped: number; errors: string[] }> {
  const url = new URL('/api/backup/import', location.origin)
  url.searchParams.set('userId', userId)
  if (options?.onConflict) url.searchParams.set('onConflict', options.onConflict)

  const isBlob = data instanceof Blob
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: isBlob ? {} : { 'Content-Type': 'application/json' },
    body: isBlob ? data : JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any)?.error ?? 'Failed to import user data')
  }
  return (await res.json()) as { imported: number; skipped: number; errors: string[] }
}

export async function getProjectVersions(userId: string, projectId: string, limit?: number): Promise<ProjectVersion[]> {
  const url = new URL(`/api/projects/${projectId}/versions`, location.origin)
  url.searchParams.set('userId', userId)
  if (limit !== undefined) url.searchParams.set('limit', String(limit))
  const res = await fetch(url.toString())
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any)?.error ?? 'Failed to fetch project versions')
  }
  const data = await res.json()
  return data.versions as ProjectVersion[]
}

export async function getProjectVersion(userId: string, projectId: string, versionId: string): Promise<ProjectVersion> {
  const url = new URL(`/api/projects/${projectId}/versions/${versionId}`, location.origin)
  url.searchParams.set('userId', userId)
  const res = await fetch(url.toString())
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any)?.error ?? 'Failed to fetch project version')
  }
  return (await res.json()) as ProjectVersion
}

export async function createProjectVersion(userId: string, projectId: string, description?: string): Promise<ProjectVersion> {
  const url = new URL(`/api/projects/${projectId}/versions`, location.origin)
  url.searchParams.set('userId', userId)
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any)?.error ?? 'Failed to create project version')
  }
  return (await res.json()) as ProjectVersion
}

export async function restoreProjectVersion(userId: string, projectId: string, versionId: string): Promise<Project> {
  const url = new URL(`/api/projects/${projectId}/versions/${versionId}/restore`, location.origin)
  url.searchParams.set('userId', userId)
  const res = await fetch(url.toString(), { method: 'POST' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any)?.error ?? 'Failed to restore project version')
  }
  return (await res.json()) as Project
}

export async function deleteProjectVersion(userId: string, projectId: string, versionId: string): Promise<void> {
  const url = new URL(`/api/projects/${projectId}/versions/${versionId}`, location.origin)
  url.searchParams.set('userId', userId)
  const res = await fetch(url.toString(), { method: 'DELETE' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any)?.error ?? 'Failed to delete project version')
  }
}
