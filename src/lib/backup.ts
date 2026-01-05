import { getAdminDb, runTransaction } from './firebaseAdmin'

export interface BackupData {
  version: string
  exportedAt: number
  userId: string
  projects: BackupProject[]
}

export interface BackupProject {
  id: string
  name: string
  code: string
  nodes: any[]
  edges: any[]
  updatedAt: number
  isDeleted: boolean
  deletedAt?: number
  history: BackupHistoryEntry[]
}

export interface BackupHistoryEntry {
  id: string
  action: string
  changedBy: string
  changedAt: number
  previousValues?: Record<string, any>
}

export async function exportUserData(userId: string): Promise<BackupData> {
  const db: any = getAdminDb()
  const backup: BackupData = {
    version: '1.0',
    exportedAt: Date.now(),
    userId,
    projects: [],
  }

  const projectsSnapshot = await db
    .collection('users')
    .doc(userId)
    .collection('projects')
    .get()

  for (const projectDoc of projectsSnapshot.docs) {
    const projectData = projectDoc.data()
    const project: BackupProject = {
      id: projectDoc.id,
      name: projectData.name,
      code: projectData.code,
      nodes: projectData.nodes,
      edges: projectData.edges,
      updatedAt: projectData.updatedAt?.toMillis?.() ?? projectData.updatedAt,
      isDeleted: projectData.isDeleted ?? false,
      deletedAt: projectData.deletedAt?.toMillis?.() ?? projectData.deletedAt,
      history: [],
    }

    const historySnapshot = await projectDoc.ref.collection('history')
      .orderBy('changedAt', 'desc')
      .get()

    for (const historyDoc of historySnapshot.docs) {
      const historyData = historyDoc.data()
      project.history.push({
        id: historyDoc.id,
        action: historyData.action,
        changedBy: historyData.changedBy,
        changedAt: historyData.changedAt?.toMillis?.() ?? historyData.changedAt,
        previousValues: historyData.previousValues,
      })
    }

    backup.projects.push(project)
  }

  return backup
}

export async function exportUserDataAsJson(userId: string): Promise<string> {
  const data = await exportUserData(userId)
  return JSON.stringify(data, null, 2)
}

export async function exportUserDataAsBlob(userId: string): Promise<Blob> {
  const json = await exportUserDataAsJson(userId)
  return new Blob([json], { type: 'application/json' })
}

export async function importUserData(
  userId: string,
  data: BackupData,
  options: { onConflict?: 'rename' | 'skip' | 'overwrite' } = {}
): Promise<{ imported: number; skipped: number; errors: string[] }> {
  const { onConflict = 'rename' } = options
  const db: any = getAdminDb()
  const result = { imported: 0, skipped: 0, errors: [] as string[] }

  for (const project of data.projects) {
    try {
      await runTransaction(async (transaction: any) => {
        const projectRef = db.collection('users').doc(userId).collection('projects').doc(project.id)
        const existingDoc = await projectRef.get()

        if (existingDoc.exists) {
          switch (onConflict) {
            case 'skip':
              result.skipped++
              return
            case 'overwrite':
              break
            case 'rename':
              const newId = `${project.id}_${Date.now()}`
              const newProjectRef = db.collection('users').doc(userId).collection('projects').doc(newId)
              const renamedProject = {
                ...project,
                id: newId,
                name: `${project.name} (Import ${new Date().toISOString()})`,
                updatedAt: Date.now(),
              }
              transaction.set(newProjectRef, renamedProject)
              result.imported++
              return
            default:
              result.errors.push(`Unknown conflict strategy: ${onConflict}`)
              return
          }
        }

        const projectData = {
          id: project.id,
          name: project.name,
          code: project.code,
          nodes: project.nodes,
          edges: project.edges,
          updatedAt: project.updatedAt,
          isDeleted: project.isDeleted,
          deletedAt: project.deletedAt,
        }

        transaction.set(projectRef, projectData)

        for (const historyEntry of project.history) {
          const historyRef = projectRef.collection('history').doc(historyEntry.id)
          const historyData = {
            id: historyEntry.id,
            projectId: project.id,
            action: historyEntry.action,
            changedBy: historyEntry.changedBy,
            changedAt: historyEntry.changedAt,
            previousValues: historyEntry.previousValues,
          }
          transaction.set(historyRef, historyData)
        }

        result.imported++
      })
    } catch (err) {
      result.errors.push(`Failed to import project ${project.id}: ${(err as Error).message}`)
    }
  }

  return result
}

export async function importUserDataFromJson(userId: string, json: string, options?: { onConflict?: 'rename' | 'skip' | 'overwrite' }): Promise<{ imported: number; skipped: number; errors: string[] }> {
  let data: BackupData
  try {
    data = JSON.parse(json) as BackupData
  } catch {
    throw new Error('Invalid JSON format')
  }

  if (data.version !== '1.0') {
    throw new Error(`Unsupported backup version: ${data.version}`)
  }

  if (data.userId !== userId) {
    throw new Error('Backup user ID does not match target user ID')
  }

  return importUserData(userId, data, options)
}

export async function importUserDataFromBlob(userId: string, blob: Blob, options?: { onConflict?: 'rename' | 'skip' | 'overwrite' }): Promise<{ imported: number; skipped: number; errors: string[] }> {
  const text = await blob.text()
  return importUserDataFromJson(userId, text, options)
}

export function validateBackupData(data: unknown): data is BackupData {
  if (!data || typeof data !== 'object') return false
  const backup = data as Record<string, any>
  return (
    backup.version === '1.0' &&
    typeof backup.exportedAt === 'number' &&
    typeof backup.userId === 'string' &&
    Array.isArray(backup.projects)
  )
}

export async function getBackupMetadata(userId: string): Promise<{ projectCount: number; lastUpdated: number }> {
  const db: any = getAdminDb()
  const projectsRef = db.collection('users').doc(userId).collection('projects')
  const snapshot = await projectsRef.orderBy('updatedAt', 'desc').limit(1).get()

  let lastUpdated = 0
  if (!snapshot.empty) {
    const lastDoc = snapshot.docs[0]
    const data = lastDoc.data()
    lastUpdated = data.updatedAt?.toMillis?.() ?? data.updatedAt ?? 0
  }

  const countSnapshot = await projectsRef.count().get()
  return {
    projectCount: countSnapshot.data().count,
    lastUpdated,
  }
}
