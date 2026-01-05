import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAdminDb } from '../../../../lib/firebaseAdmin'
import { ProjectUpdateSchema } from '../../../../validators/projectSchema'

// Helpers to extract userId param from query
function getUserIdFromRequestUrl(request: Request): string | null {
  const url = new URL(request.url)
  return url.searchParams.get('userId')
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = getUserIdFromRequestUrl(request)
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    const db: any = getAdminDb()
    const projRef = db.collection('users').doc(userId).collection('projects').doc(params.id)
    const doc = await projRef.get()
    if (!doc.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const data = doc.data()
    const updatedAt = data?.updatedAt?.toMillis ? data.updatedAt.toMillis() : data.updatedAt
    return NextResponse.json({ id: doc.id, ...data, updatedAt })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = getUserIdFromRequestUrl(request)
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    const body = await request.json()
    const parsed = ProjectUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation error', details: parsed.error.flatten() }, { status: 422 })
    }
    const db: any = getAdminDb()
    const projRef = db.collection('users').doc(userId).collection('projects').doc(params.id)
    const prevDoc = await projRef.get()
    const prevData = prevDoc.exists ? prevDoc.data() : null
    const updates = { ...parsed.data, updatedAt: Date.now() }
    await projRef.set(updates, { merge: true })
    const updatedDoc = await projRef.get()
    const data = updatedDoc.data()
    // Write update history
    const historyRef = projRef.collection('history').doc()
    await historyRef.set({
      id: historyRef.id,
      projectId: params.id,
      action: 'update',
      changedBy: userId,
      changedAt: Date.now(),
      previousValues: prevData as any
    })
    return NextResponse.json({ id: updatedDoc.id, ...data, updatedAt: data?.updatedAt ?? updates.updatedAt })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    const hard = url.searchParams.get('hard') === 'true'
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    const db: any = getAdminDb()
    const projRef = db.collection('users').doc(userId).collection('projects').doc(params.id)

    if (hard) {
      const prev = await projRef.get()
      const prevData = prev.exists ? prev.data() : null
      // Write hard delete history before deleting
      const historyRef = projRef.collection('history').doc()
      await historyRef.set({
        id: historyRef.id,
        projectId: params.id,
        action: 'delete',
        changedBy: userId,
        changedAt: Date.now(),
        previousValues: prevData as any
      })
      await projRef.delete()
      return NextResponse.json({ success: true, hardDeleted: true })
    } else {
      const prev = await projRef.get()
      const prevData = prev.exists ? prev.data() : null
      await projRef.set({ isDeleted: true, deletedAt: Date.now() }, { merge: true })
      // Audit history
      const historyRef = projRef.collection('history').doc()
      await historyRef.set({
        id: historyRef.id,
        projectId: params.id,
        action: 'delete',
        changedBy: userId,
        changedAt: Date.now(),
        previousValues: prevData as any
      })
      return NextResponse.json({ success: true, isDeleted: true })
    }
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

// POST /api/projects/[id]/restore - Restore a soft-deleted project
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = getUserIdFromRequestUrl(request)
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    const db: any = getAdminDb()
    const projRef = db.collection('users').doc(userId).collection('projects').doc(params.id)
    const doc = await projRef.get()
    if (!doc.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const data = doc.data()
    if (!data?.isDeleted) {
      return NextResponse.json({ error: 'Project is not deleted' }, { status: 400 })
    }
    // Restore by clearing soft-delete flags
    await projRef.set({ isDeleted: false, deletedAt: null, updatedAt: Date.now() }, { merge: true })
    // Write restore history
    const historyRef = projRef.collection('history').doc()
    await historyRef.set({
      id: historyRef.id,
      projectId: params.id,
      action: 'restore',
      changedBy: userId,
      changedAt: Date.now(),
      previousValues: { isDeleted: true, deletedAt: data.deletedAt }
    })
    const updatedDoc = await projRef.get()
    const updatedData = updatedDoc.data()
    return NextResponse.json({ id: updatedDoc.id, ...updatedData, updatedAt: updatedData?.updatedAt })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
