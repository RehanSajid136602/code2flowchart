import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAdminDb } from '../../../lib/firebaseAdmin'
import { ProjectInputSchema } from '../../../validators/projectSchema'

// GET /api/projects?userId=...&limit=...&cursor=...
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const limitParam = url.searchParams.get('limit')
    const cursorId = url.searchParams.get('cursor')
    const limit = limitParam ? Number(limitParam) : 20

    const db: any = getAdminDb()
    const userProjectsRef = db.collection('users').doc(userId).collection('projects')
    let q: any = userProjectsRef.where('isDeleted', '==', false).orderBy('updatedAt', 'desc').limit(limit)

    if (cursorId) {
      const cursorDoc = await userProjectsRef.doc(cursorId).get()
      if (cursorDoc.exists) {
        q = q.startAfter(cursorDoc)
      }
    }

    const snap = await q.get()
    const projects = snap.docs.map((d: any) => {
      const data = d.data()
      const updatedAt = data?.updatedAt?.toMillis ? data.updatedAt.toMillis() : Date.now()
      return {
        id: d.id,
        ...data,
        updatedAt,
      }
    }) as any

    const nextCursor = snap.size === limit ? snap.docs[snap.docs.length - 1].id : null
    return NextResponse.json({ projects, nextCursor })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

// POST /api/projects
export async function POST(request: Request) {
  try {
    type Body = { userId: string; project: any }
    const body: Body = await request.json()
    const { userId, project } = body
    if (!userId || !project) {
      return NextResponse.json({ error: 'Missing userId or project payload' }, { status: 400 })
    }

    const parsed = ProjectInputSchema.safeParse(project)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation error' }, { status: 422 })
    }

    const db: any = getAdminDb()
    const projectsRef = db.collection('users').doc(userId).collection('projects')
    const newRef = projectsRef.doc()
    const data = {
      id: newRef.id,
      name: parsed.data.name,
      code: parsed.data.code,
      nodes: parsed.data.nodes,
      edges: parsed.data.edges,
      updatedAt: Date.now(),
      isDeleted: false,
    }
    await newRef.set(data)
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
