import { z } from "zod";

export const AnalyzeRequestSchema = z.object({
  nodes: z.array(z.any()).max(100),
  edges: z.array(z.any()).max(200),
});

export const DiagramRequestSchema = z.object({
  code: z.string().max(50000),
});

export const ConvertRequestSchema = z.object({
  nodes: z.array(z.any()).max(100),
  edges: z.array(z.any()).max(200),
  language: z.string().max(50),
  codingStyle: z.string().max(100).optional(),
  refinementPrompt: z.string().max(500).optional(),
});

export const ExplainRequestSchema = z.object({
  nodeLabel: z.string().max(200),
  nodeType: z.enum(["oval", "rectangle", "diamond", "parallelogram"]),
});
