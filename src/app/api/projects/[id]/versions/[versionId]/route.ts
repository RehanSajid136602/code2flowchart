import { NextResponse } from 'next/server'
import { getAdminDb, runTransaction } from '../../../../../../lib/firebaseAdmin'
import { requireAuthWithUserId, createUnauthorizedResponse, createForbiddenResponse } from '@/lib/authMiddleware'

function getUserIdFromRequest(request: Request): string | null {
  const url = new URL(request.url)
  return url.searchParams.get('userId')
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string; versionId: string }> }) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

    await requireAuthWithUserId(request, userId)

    const resolvedParams = await params
    const db: any = getAdminDb()
    const versionRef = db
      .collection('users')
      .doc(userId)
      .collection('projects')
      .doc(resolvedParams.id)
      .collection('versions')
      .doc(resolvedParams.versionId)

    const doc = await versionRef.get()
    if (!doc.exists) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 })
    }

    const data = doc.data()
    const createdAt = data.createdAt?.toMillis ? data.createdAt.toMillis() : data.createdAt
    return NextResponse.json({ id: doc.id, ...data, createdAt })
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

export async function POST(request: Request, { params }: { params: Promise<{ id: string; versionId: string }> }) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

    const auth = await requireAuthWithUserId(request, userId)

    const resolvedParams = await params
    const db: any = getAdminDb()
    const projectRef = db.collection('users').doc(userId).collection('projects').doc(resolvedParams.id)
    const versionRef = projectRef.collection('versions').doc(resolvedParams.versionId)

    const [projectDoc, versionDoc] = await Promise.all([projectRef.get(), versionRef.get()])

    if (!projectDoc.exists) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (!versionDoc.exists) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 })
    }

    const versionData = versionDoc.data()!
    const projectData = projectDoc.data()!

    const now = Date.now()

    await runTransaction(async (transaction: any) => {
      transaction.set(projectRef, {
        name: versionData.name,
        code: versionData.code,
        nodes: versionData.nodes,
        edges: versionData.edges,
        updatedAt: now,
      }, { merge: true })

      const historyRef = projectRef.collection('history').doc()
      transaction.set(historyRef, {
        id: historyRef.id,
        projectId: resolvedParams.id,
        action: 'restore',
        changedBy: auth.uid,
        changedAt: now,
        previousValues: {
          name: projectData.name,
          code: projectData.code,
          nodes: projectData.nodes,
          edges: projectData.edges,
        },
      })

      const restoreHistoryRef = versionRef.collection('history').doc()
      transaction.set(restoreHistoryRef, {
        id: restoreHistoryRef.id,
        projectId: resolvedParams.id,
        versionId: resolvedParams.versionId,
        action: 'restore',
        restoredBy: auth.uid,
        restoredAt: now,
      })
    })

    const updatedProject = await projectRef.get()
    const updatedData = updatedProject.data()
    const updatedAt = updatedData?.updatedAt?.toMillis ? updatedData.updatedAt.toMillis() : updatedData?.updatedAt

    return NextResponse.json({ id: updatedProject.id, ...updatedData, updatedAt })
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return createUnauthorizedResponse()
    }
    if (err.message === 'FORBIDDEN_USER_MISMATCH') {
      return createForbiddenResponse('You can only restore your own project versions')
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; versionId: string }> }) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

    await requireAuthWithUserId(request, userId)

    const resolvedParams = await params
    const db: any = getAdminDb()
    const versionRef = db
      .collection('users')
      .doc(userId)
      .collection('projects')
      .doc(resolvedParams.id)
      .collection('versions')
      .doc(resolvedParams.versionId)

    const doc = await versionRef.get()
    if (!doc.exists) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 })
    }

    await versionRef.delete()
    return NextResponse.json({ success: true, deleted: true })
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return createUnauthorizedResponse()
    }
    if (err.message === 'FORBIDDEN_USER_MISMATCH') {
      return createForbiddenResponse('You can only delete your own project versions')
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
