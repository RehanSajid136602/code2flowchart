import { validateBackupData } from '../../src/lib/backup'

describe('Backup Validation', () => {
  describe('validateBackupData', () => {
    const validBackup = {
      version: '1.0',
      exportedAt: 1704067200000,
      userId: 'user_123',
      projects: [],
    }

    it('accepts valid backup data', () => {
      expect(validateBackupData(validBackup)).toBe(true)
    })

    it('rejects null', () => {
      expect(validateBackupData(null)).toBe(false)
    })

    it('rejects non-object', () => {
      expect(validateBackupData('string')).toBe(false)
      expect(validateBackupData(123)).toBe(false)
    })

    it('rejects missing version', () => {
      const { version, ...rest } = validBackup
      expect(validateBackupData(rest)).toBe(false)
    })

    it('rejects invalid version', () => {
      expect(validateBackupData({ ...validBackup, version: '2.0' })).toBe(false)
    })

    it('rejects missing exportedAt', () => {
      const { exportedAt, ...rest } = validBackup
      expect(validateBackupData(rest)).toBe(false)
    })

    it('rejects non-number exportedAt', () => {
      expect(validateBackupData({ ...validBackup, exportedAt: 'string' })).toBe(false)
    })

    it('rejects missing userId', () => {
      const { userId, ...rest } = validBackup
      expect(validateBackupData(rest)).toBe(false)
    })

    it('rejects non-string userId', () => {
      expect(validateBackupData({ ...validBackup, userId: 123 })).toBe(false)
    })

    it('rejects missing projects', () => {
      const { projects, ...rest } = validBackup
      expect(validateBackupData(rest)).toBe(false)
    })

    it('rejects non-array projects', () => {
      expect(validateBackupData({ ...validBackup, projects: {} })).toBe(false)
    })

    it('accepts backup with projects', () => {
      const backupWithProjects = {
        ...validBackup,
        projects: [
          {
            id: 'project_1',
            name: 'Test',
            code: '// code',
            nodes: [],
            edges: [],
            updatedAt: 1704067200000,
            isDeleted: false,
            history: [],
          },
        ],
      }
      expect(validateBackupData(backupWithProjects)).toBe(true)
    })
  })
})
