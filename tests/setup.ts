import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

global.TextEncoder = TextEncoder as any
global.TextDecoder = TextDecoder as any

jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => []),
  getApp: jest.fn(() => null),
}))

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => null),
  onAuthStateChanged: jest.fn(),
}))

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => null),
}))

jest.mock('firebase/analytics', () => ({
  isSupported: jest.fn(() => Promise.resolve(false)),
  getAnalytics: jest.fn(() => null),
}))

beforeEach(() => {
  jest.clearAllMocks()
})
