import { NextResponse } from 'next/server'
import { collection, doc, setDoc, getDocs, query, orderBy } from 'firebase/firestore'
import { getFirebaseFirestore } from '@/lib/firebase'
import { ProjectInputSchema, ProjectUpdateSchema } from '@/validators/projectSchema'
import { requireAuthWithUserId, createUnauthorizedResponse, createForbiddenResponse } from '@/lib/authMiddleware'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const auth = await requireAuthWithUserId(request, userId)
    const db = getFirebaseFirestore()
    if (!db) {
      return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
    }

    const userProjectsRef = collection(db, 'users', userId, 'projects')
    const q = query(userProjectsRef, orderBy('updatedAt', 'desc'))

    const snap = await getDocs(q)
    const projects = snap.docs.map(d => {
      const data = d.data()
      const updatedAt = data?.updatedAt?.toMillis ? data.updatedAt.toMillis() : Date.now()
      return {
        id: d.id,
        ...data,
        updatedAt,
      }
    })

    return NextResponse.json({ projects })
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return createUnauthorizedResponse()
    }
    if (error.message === 'FORBIDDEN_USER_MISMATCH') {
      return createForbiddenResponse('You can only access your own projects')
    }
    return NextResponse.json({ error: error?.message || 'An error occurred' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, project } = body
    if (!userId || !project) {
      return NextResponse.json({ error: 'Missing userId or project payload' }, { status: 400 })
    }

    const auth = await requireAuthWithUserId(request, userId)
    const parsed = ProjectInputSchema.safeParse(project)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation error', details: parsed.error.flatten() }, { status: 422 })
    }

    const db = getFirebaseFirestore()
    if (!db) {
      return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
    }

    const userProjectsRef = collection(db, 'users', userId, 'projects')
    const newRef = doc(userProjectsRef, project.id)
    const data = {
      id: newRef.id,
      name: parsed.data.name,
      code: parsed.data.code,
      nodes: parsed.data.nodes,
      edges: parsed.data.edges,
      updatedAt: new Date().getTime(),
      isDeleted: false,
    }

    await setDoc(newRef, data)
    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return createUnauthorizedResponse()
    }
    if (error.message === 'FORBIDDEN_USER_MISMATCH') {
      return createForbiddenResponse('You can only create your own projects')
    }
    return NextResponse.json({ error: error?.message || 'An error occurred' }, { status: 500 })
  }
}
