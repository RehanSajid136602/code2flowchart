import { z } from 'zod'

export const ProjectInputSchema = z.object({
  name: z.string().min(1),
  code: z.string(),
  nodes: z.array(z.any()),
  edges: z.array(z.any())
})

export const ProjectUpdateSchema = z.object({
  name: z.string().optional(),
  code: z.string().optional(),
  nodes: z.array(z.any()).optional(),
  edges: z.array(z.any()).optional()
})

export type ProjectInput = z.infer<typeof ProjectInputSchema>
export type ProjectUpdateInput = z.infer<typeof ProjectUpdateSchema>
