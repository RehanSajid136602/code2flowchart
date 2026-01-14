import { NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebaseAdmin'
import { rateLimit, getClientIdentifier, createRateLimitResponse, applyRateLimitHeaders } from '@/lib/rateLimit'

const SHARE_RATE_LIMIT = { maxRequests: 60, windowMs: 60000 }

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const clientId = getClientIdentifier(request)
    const rateLimitResult = rateLimit(clientId, SHARE_RATE_LIMIT)

    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult.resetTime!)
    }

    const resolvedParams = await params
    const db = getAdminDb()

    const projectsRef = db.collection('users')
    const querySnapshot = await projectsRef
      .where('shareId', '==', resolvedParams.id)
      .where('isPublic', '==', true)
      .where('isDeleted', '==', false)
      .limit(1)
      .get()

    if (querySnapshot.empty) {
      const jsonResponse = NextResponse.json(
        { error: 'Shared project not found or has been removed' },
        { status: 404 }
      )
      return applyRateLimitHeaders(jsonResponse, rateLimitResult.remaining!, rateLimitResult.resetTime!)
    }

    const doc = querySnapshot.docs[0]
    const data = doc.data()

    if (!data || !doc.exists) {
      const jsonResponse = NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
      return applyRateLimitHeaders(jsonResponse, rateLimitResult.remaining!, rateLimitResult.resetTime!)
    }

    const project = {
      id: doc.id,
      name: data.name,
      code: data.code,
      nodes: data.nodes || [],
      edges: data.edges || [],
      shareId: data.shareId,
      sharedBy: data.sharedBy,
      sharedAt: data.sharedAt,
    }

    const jsonResponse = NextResponse.json({ project })
    return applyRateLimitHeaders(jsonResponse, rateLimitResult.remaining!, rateLimitResult.resetTime!)
  } catch (error) {
    console.error('Failed to fetch shared project:', error)
    return NextResponse.json(
      { error: 'Failed to load shared project' },
      { status: 500 }
    )
  }
}
