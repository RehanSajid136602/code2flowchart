import { NextResponse } from 'next/server'
import { getAdminDb } from '../../../../../lib/firebaseAdmin'
import { requireAuthWithUserId, createUnauthorizedResponse, createForbiddenResponse } from '@/lib/authMiddleware'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

    await requireAuthWithUserId(request, userId)

    const resolvedParams = await params
    const db: any = getAdminDb()
    const historyRef = db.collection('users').doc(userId).collection('projects').doc(resolvedParams.id).collection('history')
    const snap = await historyRef.orderBy('changedAt', 'desc').get()
    const history = snap.docs.map((d: any) => {
      const data = d.data()
      return { id: d.id, ...data }
    })
    return NextResponse.json({ history })
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return createUnauthorizedResponse()
    }
    if (err.message === 'FORBIDDEN_USER_MISMATCH') {
      return createForbiddenResponse('You can only access your own project history')
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
