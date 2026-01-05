let adminModule: any = null
let initialized = false
let dbInstance: any = null

function getAdmin(): any {
  if (!adminModule) {
    try {
      adminModule = require('firebase-admin')
    } catch {
      throw new Error('Firebase Admin SDK is not available in this environment')
    }
  }
  return adminModule
}

function getCert(): any {
  const certEnv = process.env.FIREBASE_ADMIN_SDK_CERT
  if (!certEnv) {
    throw new Error('FIREBASE_ADMIN_SDK_CERT is not configured')
  }
  try {
    return JSON.parse(certEnv)
  } catch {
    throw new Error('FIREBASE_ADMIN_SDK_CERT must be valid JSON')
  }
}

function ensureInitialized(): void {
  if (initialized) return
  const admin = getAdmin()
  const cert = getCert()
  const projectId = process.env.FIREBASE_PROJECT_ID || cert.project_id
  admin.initializeApp({
    credential: admin.credential.cert(cert),
    databaseURL: process.env.FIREBASE_DATABASE_URL || `https://${projectId}.firebaseio.com`
  })
  initialized = true
  dbInstance = admin.firestore()
}

export function getAdminDb(): any {
  ensureInitialized()
  return dbInstance
}

export async function runTransaction<T>(callback: (transaction: any) => Promise<T>): Promise<T> {
  const db = getAdminDb()
  return db.runTransaction(async (transaction: any) => {
    return callback(transaction)
  })
}

export function getAdminAuth(): any {
  const admin = getAdmin()
  ensureInitialized()
  return admin.auth()
}

export default getAdminDb
