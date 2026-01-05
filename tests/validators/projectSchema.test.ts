import { ProjectInputSchema, ProjectUpdateSchema } from '../../src/validators/projectSchema'

describe('Project Validation', () => {
  describe('ProjectInputSchema', () => {
    const validProject = {
      name: 'Test Project',
      code: 'function test() { return true; }',
      nodes: [{ id: '1', type: 'oval', data: { label: 'Start' }, position: { x: 0, y: 0 } }],
      edges: [],
    }

    it('accepts valid project input', () => {
      const result = ProjectInputSchema.safeParse(validProject)
      expect(result.success).toBe(true)
    })

    it('rejects missing name', () => {
      const result = ProjectInputSchema.safeParse({ ...validProject, name: undefined })
      expect(result.success).toBe(false)
    })

    it('rejects empty name', () => {
      const result = ProjectInputSchema.safeParse({ ...validProject, name: '' })
      expect(result.success).toBe(false)
    })

    it('rejects missing code', () => {
      const result = ProjectInputSchema.safeParse({ ...validProject, code: undefined })
      expect(result.success).toBe(false)
    })

    it('rejects missing nodes', () => {
      const result = ProjectInputSchema.safeParse({ ...validProject, nodes: undefined })
      expect(result.success).toBe(false)
    })

    it('rejects missing edges', () => {
      const result = ProjectInputSchema.safeParse({ ...validProject, edges: undefined })
      expect(result.success).toBe(false)
    })

    it('accepts empty nodes array', () => {
      const result = ProjectInputSchema.safeParse({ ...validProject, nodes: [] })
      expect(result.success).toBe(true)
    })

    it('accepts empty edges array', () => {
      const result = ProjectInputSchema.safeParse({ ...validProject, edges: [] })
      expect(result.success).toBe(true)
    })
  })

  describe('ProjectUpdateSchema', () => {
    const validUpdate = {
      name: 'Updated Name',
    }

    it('accepts valid partial update', () => {
      const result = ProjectUpdateSchema.safeParse(validUpdate)
      expect(result.success).toBe(true)
    })

    it('accepts empty object', () => {
      const result = ProjectUpdateSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('accepts multiple fields', () => {
      const result = ProjectUpdateSchema.safeParse({
        name: 'Updated Name',
        code: '// updated code',
        nodes: [],
        edges: [],
      })
      expect(result.success).toBe(true)
    })

    it('rejects invalid name type', () => {
      const result = ProjectUpdateSchema.safeParse({ name: 123 })
      expect(result.success).toBe(false)
    })
  })
})
