import { collection, doc, getDoc, setDoc, getDocs, deleteDoc, query, orderBy, Timestamp, serverTimestamp, where } from 'firebase/firestore'
import { getFirebaseFirestore } from './firebase'
import { ProjectInputSchema, ProjectUpdateSchema } from '@/validators/projectSchema'
import { Project, ProjectHistory } from '@/types'

export async function saveProject(userId: string, project: Omit<Project, 'updatedAt'>) {
  if (!userId) throw new Error('Cannot save: User ID is missing')
  if (!project.id) throw new Error('Cannot save: Project ID is missing')

  const db = getFirebaseFirestore()
  if (!db) throw new Error('Firestore not initialized. Please check your connection.')

  const projectRef = doc(db, 'users', userId, 'projects', project.id)
  const historyRef = doc(projectRef, 'history', crypto.randomUUID())

  await setDoc(projectRef, {
    ...project,
    updatedAt: serverTimestamp(),
    isDeleted: false,
  }, { merge: true })

  const previousSnapshot = await getDocs(collection(db, 'users', userId, 'projects', project.id, 'history'))
  const previousData = previousSnapshot.docs.length > 0 ? previousSnapshot.docs[0].data() : null

  await setDoc(historyRef, {
    id: historyRef.id,
    projectId: project.id,
    action: 'create',
    changedBy: userId,
    changedAt: Timestamp.now(),
    previousValues: previousData as Partial<Project>,
  })
}

export async function getProjects(userId: string, limit?: number, cursor?: number): Promise<{ projects: Project[]; nextCursor?: number }> {
  const db = getFirebaseFirestore()
  if (!db) throw new Error('Firestore not initialized')

  const userProjectsRef = collection(db, 'users', userId, 'projects')
  let q: any = query(userProjectsRef, orderBy('updatedAt', 'desc'))

  if (limit) q = q.limit(limit)
  if (cursor) q = q.startAfter(new Timestamp(cursor, 0))

  const snap = await getDocs(q)
  const projects = snap.docs.map(doc => {
    const data = doc.data() as any || {}
    return {
      id: doc.id,
      ...data,
      updatedAt: data?.updatedAt?.toMillis?.() || data?.updatedAt || Date.now(),
    } as Project
  })

  const nextCursor = snap.size === limit && snap.docs.length > 0
    ? projects[projects.length - 1]?.updatedAt
    : undefined

  return { projects, nextCursor }
}

export async function getProject(userId: string, projectId: string): Promise<Project> {
  const db = getFirebaseFirestore()
  if (!db) throw new Error('Firestore not initialized')

  const projectRef = doc(db, 'users', userId, 'projects', projectId)
  const docSnap = await getDoc(projectRef)
  if (!docSnap.exists()) {
    throw new Error('Project not found')
  }

  const data = docSnap.data() || {}
  return {
    id: docSnap.id,
    ...data,
    updatedAt: data?.updatedAt?.toMillis() || data?.updatedAt || Date.now(),
  } as Project
}

export async function updateProject(userId: string, projectId: string, updates: Partial<Project>): Promise<Project> {
  const db = getFirebaseFirestore()
  if (!db) throw new Error('Firestore not initialized')

  const projectRef = doc(db, 'users', userId, 'projects', projectId)
  const docSnap = await getDoc(projectRef)

  if (!docSnap.exists()) {
    throw new Error('Project not found')
  }

  const previousData = docSnap.data() || {}

  await setDoc(projectRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  }, { merge: true })

  const historyRef = doc(projectRef, 'history', crypto.randomUUID())
  await setDoc(historyRef, {
    id: historyRef.id,
    projectId,
    action: 'update',
    changedBy: userId,
    changedAt: Timestamp.now(),
    previousValues: previousData as Partial<Project>,
  })

  return getProject(userId, projectId)
}

export async function deleteProject(userId: string, projectId: string, hard?: boolean) {
  const db = getFirebaseFirestore()
  if (!db) throw new Error('Firestore not initialized')

  const projectRef = doc(db, 'users', userId, 'projects', projectId)
  const docSnap = await getDoc(projectRef)

  if (!docSnap.exists()) {
    throw new Error('Project not found')
  }

  const previousData = docSnap.data()

  if (hard) {
    const historyRef = doc(projectRef, 'history', crypto.randomUUID())
    await setDoc(historyRef, {
      id: historyRef.id,
      projectId,
      action: 'delete',
      changedBy: userId,
      changedAt: Timestamp.now(),
      previousValues: previousData as Partial<Project>,
    })
    await deleteDoc(projectRef)
  } else {
    await setDoc(projectRef, {
      isDeleted: true,
      deletedAt: Timestamp.now(),
      updatedAt: serverTimestamp(),
    }, { merge: true })

    const historyRef = doc(projectRef, 'history', crypto.randomUUID())
    await setDoc(historyRef, {
      id: historyRef.id,
      projectId,
      action: 'delete',
      changedBy: userId,
      changedAt: Timestamp.now(),
      previousValues: previousData as Partial<Project>,
    })
  }
}

export async function restoreProject(userId: string, projectId: string): Promise<Project> {
  const db = getFirebaseFirestore()
  if (!db) throw new Error('Firestore not initialized')

  const projectRef = doc(db, 'users', userId, 'projects', projectId)
  const docSnap = await getDoc(projectRef)

  if (!docSnap.exists()) {
    throw new Error('Project not found')
  }

  const data = docSnap.data() || {}
  const previousData = { isDeleted: data?.isDeleted, deletedAt: data?.deletedAt }

  await setDoc(projectRef, {
    isDeleted: false,
    deletedAt: null,
    updatedAt: serverTimestamp(),
  }, { merge: true })

  const historyRef = doc(projectRef, 'history', crypto.randomUUID())
  await setDoc(historyRef, {
    id: historyRef.id,
    projectId,
    action: 'restore',
    changedBy: userId,
    changedAt: Timestamp.now(),
    previousValues: previousData as Partial<Project>,
  })

  return getProject(userId, projectId)
}

export async function getProjectHistory(userId: string, projectId?: string): Promise<ProjectHistory[]> {
  const db = getFirebaseFirestore()
  if (!db) throw new Error('Firestore not initialized')

  let q: any
  if (projectId) {
    q = query(collection(db, 'users', userId, 'projects', projectId, 'history'), orderBy('changedAt', 'desc'))
  } else {
    // Global history across all projects requires a Collection Group query 
    // or iterating projects. Returning empty for now to prevent path errors.
    return []
  }

  const snap = await getDocs(q)
  return snap.docs.map(doc => {
    const data = doc.data() as any || {}
    return {
      id: doc.id,
      ...data,
      changedAt: data?.changedAt?.toMillis?.() || data?.changedAt || Date.now(),
    } as ProjectHistory
  })
}
