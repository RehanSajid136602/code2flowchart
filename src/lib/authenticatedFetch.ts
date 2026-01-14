import { getFirebaseAuth } from './firebase'

export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const auth = getFirebaseAuth()
  const user = auth?.currentUser

  const headers = new Headers(options.headers)

  if (user) {
    const token = await user.getIdToken()
    headers.set('Authorization', `Bearer ${token}`)
  }

  return fetch(url, {
    ...options,
    headers,
  })
}

export async function authenticatedJsonFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await authenticatedFetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || 'Request failed')
  }

  return response.json() as Promise<T>
}
