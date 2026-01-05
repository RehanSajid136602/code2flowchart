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
      return NextResponse.json({ error: 'Validation error' }, { status: 422 })
    }
    const db: any = getAdminDb()
    const projRef = db.collection('users').doc(userId).collection('projects').doc(params.id)
    const updates = { ...parsed.data, updatedAt: Date.now() }
    await projRef.set(updates, { merge: true })
    const updatedDoc = await projRef.get()
    const data = updatedDoc.data()
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
      await projRef.delete()
      return NextResponse.json({ success: true, hardDeleted: true })
    } else {
      const prev = await projRef.get()
      const prevData = prev.exists ? prev.data() : null
      await projRef.set({ isDeleted: true, deletedAt: Date.now() }, { merge: true })
      // Audit history
      const historyRef = projRef.collection('history').doc()
      await historyRef.set({ id: historyRef.id, action: 'delete', changedBy: userId, changedAt: Date.now(), previousValues: prevData as any })
      return NextResponse.json({ success: true, isDeleted: true })
    }
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
