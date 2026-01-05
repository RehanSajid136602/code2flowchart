import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAdminDb, runTransaction } from '../../../lib/firebaseAdmin'
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
    const cursorParam = url.searchParams.get('cursor')
    const limit = limitParam ? Number(limitParam) : 20
    if (Number.isNaN(limit) || limit <= 0) {
      return NextResponse.json({ error: 'Invalid limit' }, { status: 400 })
    }

    // Cursor as numeric timestamp (milliseconds)
    const cursor = cursorParam ? Number(cursorParam) : null
    const db: any = getAdminDb()
    const userProjectsRef = db.collection('users').doc(userId).collection('projects')
    let q: any = userProjectsRef.where('isDeleted', '==', false).orderBy('updatedAt', 'desc').limit(limit)

    if (cursor != null && !Number.isNaN(cursor)) {
      q = q.startAfter(cursor)
    }

    const snap = await q.get()
    const projects = snap.docs.map((d: any) => {
      const data = d.data()
      const updatedAt = data?.updatedAt?.toMillis ? data.updatedAt.toMillis() : data.updatedAt
      return {
        id: d.id,
        ...data,
        updatedAt,
      }
    }) as any

    const lastDoc = snap.docs[snap.docs.length - 1]
    const nextCursor = (snap.size === limit && lastDoc) ? (function () {
      const data = lastDoc.data()
      const updatedAt = data?.updatedAt?.toMillis ? data.updatedAt.toMillis() : data.updatedAt
      return updatedAt
    })() : null
    return NextResponse.json({ projects, nextCursor })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

// POST /api/projects - Create project with atomic transaction
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
      return NextResponse.json({ error: 'Validation error', details: parsed.error.flatten() }, { status: 422 })
    }

    const db: any = getAdminDb()
    const userDocRef = db.collection('users').doc(userId)
    const projectsRef = userDocRef.collection('projects')
    const newProjectRef = projectsRef.doc()
    const historyRef = newProjectRef.collection('history').doc()
    const now = Date.now()

    const projectData = {
      id: newProjectRef.id,
      name: parsed.data.name,
      code: parsed.data.code,
      nodes: parsed.data.nodes,
      edges: parsed.data.edges,
      updatedAt: now,
      isDeleted: false,
    }

    const historyData = {
      id: historyRef.id,
      projectId: newProjectRef.id,
      action: 'create',
      changedBy: userId,
      changedAt: now,
    }

    await runTransaction(async (transaction: any) => {
      transaction.set(newProjectRef, projectData)
      transaction.set(historyRef, historyData)
    })

    return NextResponse.json(projectData, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
