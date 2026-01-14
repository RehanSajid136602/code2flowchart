import { NextResponse } from 'next/server'
import { getAdminDb } from '../../../../lib/firebaseAdmin'
import { ProjectUpdateSchema } from '../../../../validators/projectSchema'
import { requireAuthWithUserId, createUnauthorizedResponse, createForbiddenResponse } from '@/lib/authMiddleware'

function getUserIdFromRequestUrl(request: Request): string | null {
  const url = new URL(request.url)
  return url.searchParams.get('userId')
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = getUserIdFromRequestUrl(request)
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    
    await requireAuthWithUserId(request, userId)
    const resolvedParams = await params
    const db: any = getAdminDb()
    const projRef = db.collection('users').doc(userId).collection('projects').doc(resolvedParams.id)
    const doc = await projRef.get()
    if (!doc.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const data = doc.data()
    const updatedAt = data?.updatedAt?.toMillis ? data.updatedAt.toMillis() : data.updatedAt
    return NextResponse.json({ id: doc.id, ...data, updatedAt })
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return createUnauthorizedResponse()
    }
    if (err.message === 'FORBIDDEN_USER_MISMATCH') {
      return createForbiddenResponse('You can only access your own projects')
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = getUserIdFromRequestUrl(request)
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    
    const auth = await requireAuthWithUserId(request, userId)
    const resolvedParams = await params
    const body = await request.json()
    const parsed = ProjectUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation error', details: parsed.error.flatten() }, { status: 422 })
    }
    const db: any = getAdminDb()
    const projRef = db.collection('users').doc(userId).collection('projects').doc(resolvedParams.id)
    const prevDoc = await projRef.get()
    const prevData = prevDoc.exists ? prevDoc.data() : null
    const updates = { ...parsed.data, updatedAt: Date.now() }
    await projRef.set(updates, { merge: true })
    const updatedDoc = await projRef.get()
    const data = updatedDoc.data()
    const historyRef = projRef.collection('history').doc()
    await historyRef.set({
      id: historyRef.id,
      projectId: resolvedParams.id,
      action: 'update',
      changedBy: auth.uid,
      changedAt: Date.now(),
      previousValues: prevData as any
    })
    return NextResponse.json({ id: updatedDoc.id, ...data, updatedAt: data?.updatedAt ?? updates.updatedAt })
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return createUnauthorizedResponse()
    }
    if (err.message === 'FORBIDDEN_USER_MISMATCH') {
      return createForbiddenResponse('You can only update your own projects')
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    const hard = url.searchParams.get('hard') === 'true'
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    
    const auth = await requireAuthWithUserId(request, userId)
    const resolvedParams = await params
    const db: any = getAdminDb()
    const projRef = db.collection('users').doc(userId).collection('projects').doc(resolvedParams.id)

    if (hard) {
      const prev = await projRef.get()
      const prevData = prev.exists ? prev.data() : null
      const historyRef = projRef.collection('history').doc()
      await historyRef.set({
        id: historyRef.id,
        projectId: resolvedParams.id,
        action: 'delete',
        changedBy: auth.uid,
        changedAt: Date.now(),
        previousValues: prevData as any
      })
      await projRef.delete()
      return NextResponse.json({ success: true, hardDeleted: true })
    } else {
      const prev = await projRef.get()
      const prevData = prev.exists ? prev.data() : null
      await projRef.set({ isDeleted: true, deletedAt: Date.now() }, { merge: true })
      const historyRef = projRef.collection('history').doc()
      await historyRef.set({
        id: historyRef.id,
        projectId: resolvedParams.id,
        action: 'delete',
        changedBy: auth.uid,
        changedAt: Date.now(),
        previousValues: prevData as any
      })
      return NextResponse.json({ success: true, isDeleted: true })
    }
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return createUnauthorizedResponse()
    }
    if (err.message === 'FORBIDDEN_USER_MISMATCH') {
      return createForbiddenResponse('You can only delete your own projects')
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = getUserIdFromRequestUrl(request)
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    
    const auth = await requireAuthWithUserId(request, userId)
    const resolvedParams = await params
    const db: any = getAdminDb()
    const projRef = db.collection('users').doc(userId).collection('projects').doc(resolvedParams.id)
    const doc = await projRef.get()
    if (!doc.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const data = doc.data()
    if (!data?.isDeleted) {
      return NextResponse.json({ error: 'Project is not deleted' }, { status: 400 })
    }
    await projRef.set({ isDeleted: false, deletedAt: null, updatedAt: Date.now() }, { merge: true })
    const historyRef = projRef.collection('history').doc()
    await historyRef.set({
      id: historyRef.id,
      projectId: resolvedParams.id,
      action: 'restore',
      changedBy: auth.uid,
      changedAt: Date.now(),
      previousValues: { isDeleted: true, deletedAt: data.deletedAt }
    })
    const updatedDoc = await projRef.get()
    const updatedData = updatedDoc.data()
    return NextResponse.json({ id: updatedDoc.id, ...updatedData, updatedAt: updatedData?.updatedAt })
    } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return createUnauthorizedResponse()
    }
    if (err.message === 'FORBIDDEN_USER_MISMATCH') {
      return createForbiddenResponse('You can only restore your own projects')
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = getUserIdFromRequestUrl(request)
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

    const auth = await requireAuthWithUserId(request, userId)
    const resolvedParams = await params
    const body = await request.json()
    const { action } = body

    const db: any = getAdminDb()
    const projRef = db.collection('users').doc(userId).collection('projects').doc(resolvedParams.id)
    const doc = await projRef.get()

    if (!doc.exists) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (action === 'share') {
      const shareId = crypto.randomUUID()
      const updates = {
        shareId,
        isPublic: true,
        sharedBy: auth.uid,
        sharedAt: Date.now(),
        updatedAt: Date.now()
      }

      await projRef.set(updates, { merge: true })

      const updatedDoc = await projRef.get()
      const data = updatedDoc.data()

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '')

      return NextResponse.json({
        id: updatedDoc.id,
        ...data,
        updatedAt: data?.updatedAt ?? updates.updatedAt,
        shareUrl: `${baseUrl}/share/${shareId}`
      })
    }

    if (action === 'unshare') {
      const updates = {
        isPublic: false,
        shareId: null,
        sharedBy: null,
        sharedAt: null,
        updatedAt: Date.now()
      }

      await projRef.set(updates, { merge: true })

      const updatedDoc = await projRef.get()
      const data = updatedDoc.data()

      return NextResponse.json({
        id: updatedDoc.id,
        ...data,
        updatedAt: data?.updatedAt ?? updates.updatedAt
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return createUnauthorizedResponse()
    }
    if (err.message === 'FORBIDDEN_USER_MISMATCH') {
      return createForbiddenResponse('You can only share your own projects')
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
