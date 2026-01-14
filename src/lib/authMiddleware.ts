import { getAdminAuth } from './firebaseAdmin'

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string
    email?: string | null
  }
}

export async function verifyAuthToken(request: Request): Promise<{ uid: string; email?: string | null } | null> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    const adminAuth = getAdminAuth()
    const decoded = await adminAuth.verifyIdToken(token)

    return {
      uid: decoded.uid,
      email: decoded.email || null
    }
  } catch {
    return null
  }
}

export function createUnauthorizedResponse() {
  return new Response(
    JSON.stringify({ error: 'Unauthorized. Please sign in again.' }),
    { status: 401, headers: { 'Content-Type': 'application/json' } }
  )
}

export function createForbiddenResponse(message = 'Access denied') {
  return new Response(
    JSON.stringify({ error: message }),
    { status: 403, headers: { 'Content-Type': 'application/json' } }
  )
}

export async function requireAuth(
  request: Request,
  options?: { requireVerifiedEmail?: boolean }
): Promise<{ uid: string; email?: string | null }> {
  const auth = await verifyAuthToken(request)

  if (!auth) {
    throw new Error('UNAUTHORIZED')
  }

  if (options?.requireVerifiedEmail && !auth.email) {
    throw new Error('FORBIDDEN_EMAIL_NOT_VERIFIED')
  }

  return auth
}

export async function requireAuthWithUserId(
  request: Request,
  providedUserId: string | null,
  options?: { requireVerifiedEmail?: boolean }
): Promise<{ uid: string; email?: string | null }> {
  const auth = await requireAuth(request, options)

  if (!providedUserId) {
    throw new Error('BAD_REQUEST_MISSING_USER_ID')
  }

  if (auth.uid !== providedUserId) {
    throw new Error('FORBIDDEN_USER_MISMATCH')
  }

  return auth
}
