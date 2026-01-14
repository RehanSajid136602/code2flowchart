import { NextResponse } from "next/server";
import { z } from "zod";
import { getDynamicConfig } from "@/lib/gemini";
import { DiagramRequestSchema } from "@/validators/aiRequestsSchema";
import { verifyAuthToken } from "@/lib/authMiddleware";
import { rateLimit, getClientIdentifier, createRateLimitResponse, applyRateLimitHeaders } from "@/lib/rateLimit";

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

const AI_RATE_LIMIT = { maxRequests: 30, windowMs: 60000 };

export async function POST(req: Request) {
  try {
    const auth = await verifyAuthToken(req);
    // Auth is now optional for diagram generation to support Guest Mode
    const isGuest = !auth;

    const clientId = getClientIdentifier(req);
    const rateLimitResult = rateLimit(clientId, AI_RATE_LIMIT);

    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult.resetTime!);
    }

    const body = await req.json();
    const parsed = DiagramRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    const { code } = parsed.data;
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
    const aiResponse = await result.response;
    let text = aiResponse.text().trim();

    if (text.startsWith("```json")) {
      text = text.replace(/```json|```/g, "").trim();
    } else if (text.startsWith("```")) {
      text = text.replace(/```[a-z]*|```/g, "").trim();
    }

    try {
      const parsedJson = JSON.parse(text);
      const validated = ResponseSchema.parse(parsedJson);
      const jsonResponse = NextResponse.json({ ...validated, modelUsed: modelName });
      return applyRateLimitHeaders(jsonResponse, rateLimitResult.remaining!, rateLimitResult.resetTime!);
    } catch (parseError: any) {
      console.error("AI Response Parse Error:", parseError, "Text:", text);
      return NextResponse.json({
        error: "High-performance AI returned incompatible logical structures. Please refine your logic.",
        details: parseError.message
      }, { status: 422 });
    }
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({
      error: error?.message === 'UNAUTHORIZED' ? 'Please sign in to access advanced features' : "The logic engine encountered a synchronization failure.",
      details: error?.message
    }, { status: error?.message === 'UNAUTHORIZED' ? 401 : 500 });
  }
}