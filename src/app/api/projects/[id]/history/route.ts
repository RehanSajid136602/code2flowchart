import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAdminDb } from '../../../../../lib/firebaseAdmin'

// GET /api/projects/[id]/history?userId=...
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    const db: any = getAdminDb()
    const historyRef = db.collection('users').doc(userId).collection('projects').doc(params.id).collection('history')
    const snap = await historyRef.orderBy('changedAt', 'desc').get()
    const history = snap.docs.map((d: any) => {
      const data = d.data()
      return { id: d.id, ...data }
    })
    return NextResponse.json({ history })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
