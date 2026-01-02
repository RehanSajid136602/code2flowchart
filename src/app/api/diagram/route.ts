import { NextResponse } from "next/server";
import { z } from "zod";
import { getDynamicConfig } from "@/lib/gemini";

const NodeSchema = z.object({
  id: z.string(),
  type: z.enum(["oval", "rectangle", "diamond", "parallelogram"]),
  data: z.object({
    label: z.string(),
  }),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
});

const EdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  label: z.string().optional(),
});

const ResponseSchema = z.object({
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
});

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    const { model, modelName } = getDynamicConfig();

    const prompt = `
      You are an expert software architect and flow analyst. 
      Convert the following code into a flowchart JSON structure compatible with React Flow.
      Using model: ${modelName}
      
      CODE:
      """
      ${code}
      """

      RULES:
      1. MANDATORY SHAPE MAPPING:
         - 'oval': Entry/Exit points of the function/script.
         - 'rectangle': SEMANTIC PROCESS BLOCKS. Group related sequential lines (e.g., variable initializations, calculations) into a single logical node. Do NOT create a node for every line.
         - 'diamond': Decisions and Loops. Use for 'if', 'else', 'for', 'while', 'switch'.
         - 'parallelogram': I/O operations (logging, reading, writing).
      2. LOGICAL ABSTRACTION:
         - For large codes, prioritize high-level flow over micro-steps.
         - Combine consecutive 'rectangle' steps into one node with a multi-line label if they are part of the same task.
      3. ADVANCED LAYOUT STRATEGY:
         - VERTICAL: Minimum layer gap of 220 units (y += 220) to allow for complex labels.
         - HORIZONTAL BREADTH: 
            - Main trunk: x = 500.
            - Level 1 Branch: Offset +/- 350 units.
            - Level 2+ Branch: Offset +/- 600 units to prevent overlap in nested logic.
      4. Decision nodes MUST have exactly two outgoing edges with labels 'True' and 'False'.
      5. Nodes must have unique string IDs and consistent edges.

      OUTPUT FORMAT:
      {
        "nodes": [{"id": "1", "type": "oval", "data": {"label": "Start"}, "position": {"x": 250, "y": 0}}, ...],
        "edges": [{"id": "e1-2", "source": "1", "target": "2", "label": ""}, ...]
      }

      Return ONLY the JSON. No markdown formatting, no explanations.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    
    if (text.startsWith("```json")) {
      text = text.replace(/```json|```/g, "").trim();
    }

    try {
      const parsed = JSON.parse(text);
      const validated = ResponseSchema.parse(parsed);
      return NextResponse.json({ ...validated, modelUsed: modelName });
    } catch (e: any) {
      return NextResponse.json({
        error: "Invalid AI response format",
        details: e.message,
        raw: text
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({
      error: error.message || "Failed to generate diagram",
      type: error.name || "Error"
    }, { status: 500 });
  }
}