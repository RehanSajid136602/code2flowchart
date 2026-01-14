import { z } from 'zod'

const NodeDataSchema = z.object({
  label: z.string(),
}).passthrough()

const NodeSchema = z.object({
  id: z.string().max(255),
  type: z.enum(['oval', 'rectangle', 'diamond', 'parallelogram']),
  data: NodeDataSchema,
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
}).passthrough()

const EdgeSchema = z.object({
  id: z.string().max(255),
  source: z.string().max(255),
  target: z.string().max(255),
  label: z.string().optional(),
}).passthrough()

export const ProjectInputSchema = z.object({
  name: z.string().min(1).max(255),
  code: z.string().max(1000000),
  nodes: z.array(NodeSchema).max(500),
  edges: z.array(EdgeSchema).max(1000)
})

export const ProjectUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  code: z.string().max(1000000).optional(),
  nodes: z.array(NodeSchema).max(500).optional(),
  edges: z.array(EdgeSchema).max(1000).optional()
})

export type ProjectInput = z.infer<typeof ProjectInputSchema>
export type ProjectUpdateInput = z.infer<typeof ProjectUpdateSchema>
