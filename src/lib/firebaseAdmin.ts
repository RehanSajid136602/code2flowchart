let adminModule: any = null
let initialized = false

function getAdmin(): any {
  if (!adminModule) {
    try {
      // Dynamically require to avoid hard dependency in non-server environments
      adminModule = require('firebase-admin')
    } catch {
      throw new Error('Firebase Admin SDK is not available in this environment')
    }
  }
  return adminModule
}

function ensureInitialized(): void {
  const admin = getAdmin()
  if (!initialized) {
    const certEnv = process.env.FIREBASE_ADMIN_SDK_CERT
    if (!certEnv) {
      throw new Error('FIREBASE_ADMIN_SDK_CERT is not configured')
    }
    const cert = typeof certEnv === 'string' ? JSON.parse(certEnv) : certEnv
    admin.initializeApp({ credential: admin.credential.cert(cert) })
    initialized = true
  }
}

export function getAdminDb(): any {
  const admin = getAdmin()
  ensureInitialized()
  return admin.firestore()
}

export default getAdminDb
