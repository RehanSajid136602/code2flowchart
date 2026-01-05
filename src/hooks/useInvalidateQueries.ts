import { useQueryClient } from '@tanstack/react-query'

export function useInvalidateProjects() {
  const queryClient = useQueryClient()

  return {
    invalidateAll: (userId: string) => {
      queryClient.invalidateQueries({ queryKey: ['projects', userId] })
    },
    invalidateProject: (userId: string, projectId: string) => {
      queryClient.invalidateQueries({ queryKey: ['project', userId, projectId] })
      queryClient.invalidateQueries({ queryKey: ['projects', userId] })
    },
    invalidateHistory: (userId: string, projectId: string) => {
      queryClient.invalidateQueries({ queryKey: ['projectHistory', userId, projectId] })
    },
    invalidateVersions: (userId: string, projectId: string) => {
      queryClient.invalidateQueries({ queryKey: ['projectVersions', userId, projectId] })
    },
    invalidateBackup: (userId: string) => {
      queryClient.invalidateQueries({ queryKey: ['backupMetadata', userId] })
    },
    prefetchProjects: async (userId: string, options?: { limit?: number; cursor?: number }) => {
      const url = new URL('/api/projects', location.origin)
      url.searchParams.set('userId', userId)
      if (options?.limit) url.searchParams.set('limit', String(options.limit))
      if (options?.cursor) url.searchParams.set('cursor', String(options.cursor))
      await queryClient.prefetchQuery({
        queryKey: ['projects', userId, options],
        queryFn: () => fetch(url.toString()).then(r => r.json()),
      })
    },
    setProjects: (userId: string, data: { projects: any[]; nextCursor?: number }) => {
      queryClient.setQueryData(['projects', userId], data)
    },
    setProject: (userId: string, projectId: string, data: any) => {
      queryClient.setQueryData(['project', userId, projectId], data)
    },
  }
}
