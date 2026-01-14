"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { Project, ProjectHistory, ProjectVersion } from "@/types"

async function fetcher(url: string, options: RequestInit = {}) {
  const res = await fetch(url, options)
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.error || "An error occurred while fetching data")
  }
  return res.json()
}

export function useProjects(userId: string | null) {
  const query = useQuery({
    queryKey: ["projects", userId],
    queryFn: () => fetcher(`/api/projects?userId=${userId}`, {}),
    enabled: !!userId,
  })
  
  return {
    ...query,
    isLoading: query.isLoading || (query.status === "pending" && !userId),
  }
}

export function useProject(userId: string | null, projectId: string | null) {
  const query = useQuery({
    queryKey: ["project", userId, projectId],
    queryFn: () => fetcher(`/api/projects/${projectId}?userId=${userId}`, {}),
    enabled: !!userId && !!projectId,
  })

  return {
    ...query,
    isLoading: query.isLoading || (query.status === "pending" && (!userId || !projectId)),
  }
}

export function useProjectHistory(userId: string | null, projectId: string | null) {
  const query = useQuery({
    queryKey: ["history", userId, projectId],
    queryFn: () => fetcher(`/api/projects/${projectId}/history?userId=${userId}`, {}),
    enabled: !!userId && !!projectId,
  })

  return {
    ...query,
    isLoading: query.isLoading || (query.status === "pending" && (!userId || !projectId)),
  }
}

export function useProjectVersions(userId: string | null, projectId: string | null) {
  const query = useQuery({
    queryKey: ["versions", userId, projectId],
    queryFn: () => fetcher(`/api/projects/${projectId}/versions?userId=${userId}`, {}),
    enabled: !!userId && !!projectId,
  })

  return {
    ...query,
    isLoading: query.isLoading || (query.status === "pending" && (!userId || !projectId)),
  }
}

export function useInvalidateQueries() {
  const queryClient = useQueryClient()
  return (userId: string, projectId?: string) => {
    queryClient.invalidateQueries({ queryKey: ["projects", userId] })
    if (projectId) {
      queryClient.invalidateQueries({ queryKey: ["project", userId, projectId] })
      queryClient.invalidateQueries({ queryKey: ["history", userId, projectId] })
      queryClient.invalidateQueries({ queryKey: ["versions", userId, projectId] })
    }
  }
}

export function useSaveProject() {
  const invalidate = useInvalidateQueries()

  return useMutation({
    mutationFn: async ({ userId, project }: { userId: string; project: Partial<Project> }) => {
      const res = await fetch(`/api/projects?userId=${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, project }),
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to save project")
      }
      return res.json()
    },
    onSuccess: (data, variables) => {
      invalidate(variables.userId, data.id)
    },
  })
}

export function useUpdateProject() {
  const invalidate = useInvalidateQueries()

  return useMutation({
    mutationFn: async ({ userId, projectId, updates }: { userId: string; projectId: string; updates: Partial<Project> }) => {
      const res = await fetch(`/api/projects/${projectId}?userId=${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to update project")
      }
      return res.json()
    },
    onSuccess: (data, variables) => {
      invalidate(variables.userId, variables.projectId)
    },
  })
}

export function useDeleteProject() {
  const invalidate = useInvalidateQueries()

  return useMutation({
    mutationFn: async ({ userId, projectId }: { userId: string; projectId: string }) => {
      const res = await fetch(`/api/projects/${projectId}?userId=${userId}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to delete project")
      }
      return res.json()
    },
    onSuccess: (data, variables) => {
      invalidate(variables.userId, variables.projectId)
    },
  })
}
