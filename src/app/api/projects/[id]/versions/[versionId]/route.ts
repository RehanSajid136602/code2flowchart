import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAdminDb, runTransaction } from '../../../../../../lib/firebaseAdmin'

function getUserIdFromRequest(request: Request): string | null {
  const url = new URL(request.url)
  return url.searchParams.get('userId')
}

// GET /api/projects/[id]/versions/[versionId]?userId=...
export async function GET(request: Request, { params }: { params: { id: string; versionId: string } }) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

    const db: any = getAdminDb()
    const versionRef = db
      .collection('users')
      .doc(userId)
      .collection('projects')
      .doc(params.id)
      .collection('versions')
      .doc(params.versionId)

    const doc = await versionRef.get()
    if (!doc.exists) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 })
    }

    const data = doc.data()
    const createdAt = data.createdAt?.toMillis ? data.createdAt.toMillis() : data.createdAt
    return NextResponse.json({ id: doc.id, ...data, createdAt })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

// POST /api/projects/[id]/versions/[versionId]/restore?userId=...
export async function POST(request: Request, { params }: { params: { id: string; versionId: string } }) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

    const db: any = getAdminDb()
    const projectRef = db.collection('users').doc(userId).collection('projects').doc(params.id)
    const versionRef = projectRef.collection('versions').doc(params.versionId)

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
        projectId: params.id,
        action: 'restore',
        changedBy: userId,
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
        projectId: params.id,
        versionId: params.versionId,
        action: 'restore',
        restoredBy: userId,
        restoredAt: now,
      })
    })

    const updatedProject = await projectRef.get()
    const updatedData = updatedProject.data()
    const updatedAt = updatedData?.updatedAt?.toMillis ? updatedData.updatedAt.toMillis() : updatedData?.updatedAt

    return NextResponse.json({ id: updatedProject.id, ...updatedData, updatedAt })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

// DELETE /api/projects/[id]/versions/[versionId]?userId=... - Hard delete a version
export async function DELETE(request: Request, { params }: { params: { id: string; versionId: string } }) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

    const db: any = getAdminDb()
    const versionRef = db
      .collection('users')
      .doc(userId)
      .collection('projects')
      .doc(params.id)
      .collection('versions')
      .doc(params.versionId)

    const doc = await versionRef.get()
    if (!doc.exists) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 })
    }

    await versionRef.delete()
    return NextResponse.json({ success: true, deleted: true })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
