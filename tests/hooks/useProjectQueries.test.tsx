import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useProjects, useProject, useProjectHistory } from '../../src/hooks/useProjectQueries'
import { ReactNode } from 'react'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 0,
        gcTime: 0,
        retry: false,
      },
    },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useProjects', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('returns loading state initially', () => {
    const { result } = renderHook(() => useProjects(null), { wrapper: createWrapper() })
    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()
  })

  it('does not fetch when userId is null', () => {
    renderHook(() => useProjects(null), { wrapper: createWrapper() })
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('fetches projects when userId is provided', async () => {
    const mockProjects = { projects: [{ id: '1', name: 'Test' }], nextCursor: null }
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProjects,
    })

    const { result } = renderHook(() => useProjects('user_123'), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/projects?userId=user_123'),
      expect.any(Object)
    )
    expect(result.current.data).toEqual(mockProjects)
  })

  it('handles fetch error', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to fetch projects' }),
    })

    const { result } = renderHook(() => useProjects('user_123'), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeInstanceOf(Error)
    })
  })
})

describe('useProject', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('does not fetch when userId or projectId is null', () => {
    renderHook(() => useProject(null, null), { wrapper: createWrapper() })
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('fetches project when both ids are provided', async () => {
    const mockProject = { id: 'project_1', name: 'Test Project' }
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProject,
    })

    const { result } = renderHook(() => useProject('user_123', 'project_1'), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/projects/project_1?userId=user_123'),
      expect.any(Object)
    )
    expect(result.current.data).toEqual(mockProject)
  })
})

describe('useProjectHistory', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('fetches history when both ids are provided', async () => {
    const mockHistory = { history: [{ id: '1', action: 'create' }] }
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockHistory,
    })

    const { result } = renderHook(() => useProjectHistory('user_123', 'project_1'), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/projects/project_1/history?userId=user_123'),
      expect.any(Object)
    )
    expect(result.current.data).toEqual(mockHistory)
  })
})
