import { NextResponse } from "next/server";
import { getDynamicConfig } from "@/lib/gemini";
import { AnalyzeRequestSchema } from "@/validators/aiRequestsSchema";
import { verifyAuthToken } from "@/lib/authMiddleware";
import { rateLimit, getClientIdentifier, createRateLimitResponse, applyRateLimitHeaders } from "@/lib/rateLimit";

const AI_RATE_LIMIT = { maxRequests: 30, windowMs: 60000 };

export async function POST(req: Request) {
  try {
    const auth = await verifyAuthToken(req);
    // Auth optional for Guest Mode
    const isGuest = !auth;

    const clientId = getClientIdentifier(req);
    const rateLimitResult = rateLimit(clientId, AI_RATE_LIMIT);

    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult.resetTime!);
    }

    const body = await req.json();
    const parsed = AnalyzeRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    const { nodes, edges } = parsed.data;

    const { model, modelName } = getDynamicConfig();

    const prompt = `
      Analyze this logic flowchart and its underlying code for logical bugs, efficiency issues, and algorithmic complexity.

      Nodes: ${JSON.stringify(nodes)}
      Edges: ${JSON.stringify(edges)}

      CRITICAL TASKS:
      1. Identify bugNodeIds: Nodes involved in deadlocks, infinite loops, or unreachable paths.
      2. Provide detailed Analysis: A concise top-level summary of the logic's health.
      3. Provide Suggestions: For each issue, explain the 'issue', give a 'suggestion', and provide an optional 'fix' (actual code snippets if the issue is in logic).
      4. Estimate Complexity: Time and Space Big O notation.

      RESPONSE FORMAT (STRICT JSON):
      {
        "bugNodeIds": ["id1", "id2"],
        "analysis": "Top-level summary",
        "suggestions": [
          {
            "nodeId": "1",
            "title": "Infinite Loop Detected",
            "issue": "The loop has no exit condition.",
            "suggestion": "Add a counter or a break condition.",
            "fix": "// Add this inside the loop\nif (count > 10) break;"
          }
        ],
        "complexity": {"time": "O(n)", "space": "O(1)"}
      }

      Return ONLY the raw JSON. No markdown backticks, no preamble.
    `;

    const result = await model.generateContent(prompt);
    const aiResponse = await result.response;
    let text = aiResponse.text().trim();
    if (text.startsWith("```json")) text = text.replace(/```json|```/g, "").trim();
    else if (text.startsWith("```")) text = text.replace(/```[a-z]*|```/g, "").trim();

    try {
      const parsedData = JSON.parse(text);
      const jsonResponse = NextResponse.json({ ...parsedData, modelUsed: modelName });
      return applyRateLimitHeaders(jsonResponse, rateLimitResult.remaining!, rateLimitResult.resetTime!);
    } catch (parseError: any) {
      console.error("Analysis Response Parse Error:", parseError, "Text:", text);
      return NextResponse.json({
        error: "Failed to process AI debugging results. Please refine your logic and try again.",
        details: parseError.message
      }, { status: 422 });
    }
  } catch (error: any) {
    console.error("Analysis Error:", error);
    return NextResponse.json({
      error: "The AI analysis engine encountered an internal synchronization failure.",
      details: error?.message
    }, { status: 500 });
  }
}