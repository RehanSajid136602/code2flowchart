import { Project } from '@/types'

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
