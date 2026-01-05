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
      You are an elite Software Architecture Visualizer. Your mission is to transform source code into a high-fidelity, BALANCED logic flowchart.
      
      TARGET CODE:
      """
      ${code}
      """

      STRICT VISUAL ARCHITECTURE RULES:
      1. BALANCED TEXT DENSITY (Crucial):
         - Keep labels descriptive but concise (roughly 10-15 words max).
         - Icons/Emojis are mandatory prefixes for every node.
         - Use short, impactful bullet points (•) only if necessary for clarity in sequential steps.
         - Group operations into coherent semantic blocks that describe the "What" and "Why" without getting bogged down in implementation details.

      2. SHAPE SEMANTICS & MANDATORY NODES:
         - 'oval': MUST include exactly one "🛫 Start" node at the beginning and exactly one "🏁 End" node at the very end of the logic flow.
         - 'rectangle': ⚙️ Functional logic, processing, or data transformations.
         - 'diamond': ⚖️ Decision points, validations, or branch logic.
         - 'parallelogram': 📡 External I/O (Database, Network, Logs, UI).

      3. SPATIAL ORCHESTRATION:
         - ROOT: The "🛫 Start" node must be at x: 500, y: 0.
         - VERTICAL DRIFT: Use a consistent +240 unit Y-increment.
         - HORIZONTAL SPAN:
           - Default/Main: x = 500.
           - Left Branch: x = 200.
           - Right Branch: x = 800.

      OUTPUT SCHEMA (STRICT JSON):
      {
        "nodes": [
          {
            "id": "id",
            "type": "oval | rectangle | diamond | parallelogram",
            "data": { "label": "[Emoji] [Professional Title]\\n• [Key Step 1]\\n• [Key Step 2]" },
            "position": { "x": 500, "y": 0 }
          }
        ],
        "edges": [
          { "id": "e-id", "source": "id1", "target": "id2", "label": "Semantic Label" }
        ]
      }

      Return ONLY the raw JSON. No markdown backticks, no conversational text.
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