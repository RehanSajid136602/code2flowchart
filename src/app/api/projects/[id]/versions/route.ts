import { NextResponse } from 'next/server'
import { getAdminDb, runTransaction } from '../../../../../lib/firebaseAdmin'
import { requireAuthWithUserId, createUnauthorizedResponse, createForbiddenResponse } from '@/lib/authMiddleware'

function getUserIdFromRequest(request: Request): string | null {
  const url = new URL(request.url)
  return url.searchParams.get('userId')
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

    const auth = await requireAuthWithUserId(request, userId)

    const url = new URL(request.url)
    const limitParam = url.searchParams.get('limit')
    const limit = limitParam ? Number(limitParam) : 20
    if (Number.isNaN(limit) || limit <= 0) {
      return NextResponse.json({ error: 'Invalid limit' }, { status: 400 })
    }

    const resolvedParams = await params
    const db: any = getAdminDb()
    const versionsRef = db
      .collection('users')
      .doc(userId)
      .collection('projects')
      .doc(resolvedParams.id)
      .collection('versions')
      .orderBy('version', 'desc')
      .limit(limit)

    const snapshot = await versionsRef.get()
    const versions = snapshot.docs.map((d: any) => {
      const data = d.data()
      const createdAt = data.createdAt?.toMillis ? data.createdAt.toMillis() : data.createdAt
      return {
        id: d.id,
        ...data,
        createdAt,
      }
    })

    return NextResponse.json({ versions })
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return createUnauthorizedResponse()
    }
    if (err.message === 'FORBIDDEN_USER_MISMATCH') {
      return createForbiddenResponse('You can only access your own project versions')
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

    const auth = await requireAuthWithUserId(request, userId)
    const body = await request.json()
    const { description } = body as { description?: string }

    const resolvedParams = await params
    const db: any = getAdminDb()
    const projectRef = db.collection('users').doc(userId).collection('projects').doc(resolvedParams.id)
    const projectDoc = await projectRef.get()

    if (!projectDoc.exists) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const projectData = projectDoc.data()
    const versionsRef = projectRef.collection('versions')
    const lastVersionDoc = await versionsRef.orderBy('version', 'desc').limit(1).get()
    const newVersionNumber = lastVersionDoc.empty ? 1 : (lastVersionDoc.docs[0].data().version || 0) + 1

    const versionRef = versionsRef.doc()
    const now = Date.now()

    const versionData = {
      id: versionRef.id,
      projectId: resolvedParams.id,
      version: newVersionNumber,
      name: projectData.name,
      code: projectData.code,
      nodes: projectData.nodes,
      edges: projectData.edges,
      createdAt: now,
      createdBy: auth.uid,
      description: description || `Version ${newVersionNumber}`,
    }

    await runTransaction(async (transaction: any) => {
      transaction.set(versionRef, versionData)
      const historyRef = projectRef.collection('history').doc()
      transaction.set(historyRef, {
        id: historyRef.id,
        projectId: resolvedParams.id,
        action: 'version',
        changedBy: auth.uid,
        changedAt: now,
        previousValues: { version: newVersionNumber },
      })
    })

    return NextResponse.json(versionData, { status: 201 })
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return createUnauthorizedResponse()
    }
    if (err.message === 'FORBIDDEN_USER_MISMATCH') {
      return createForbiddenResponse('You can only create versions for your own projects')
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
