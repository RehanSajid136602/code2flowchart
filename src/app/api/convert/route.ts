import { NextResponse } from "next/server";
import { getDynamicConfig } from "@/lib/gemini";
import { ConvertRequestSchema } from "@/validators/aiRequestsSchema";
import { verifyAuthToken } from "@/lib/authMiddleware";
import { rateLimit, getClientIdentifier, createRateLimitResponse, applyRateLimitHeaders } from "@/lib/rateLimit";

const AI_RATE_LIMIT = { maxRequests: 30, windowMs: 60000 };

export async function POST(req: Request) {
  try {
    const auth = await verifyAuthToken(req);
    // Auth is now optional for Guest Mode
    const isGuest = !auth;

    const clientId = getClientIdentifier(req);
    const rateLimitResult = rateLimit(clientId, AI_RATE_LIMIT);

    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult.resetTime!);
    }

    const body = await req.json();
    const parsed = ConvertRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    const { nodes, edges, language, codingStyle, refinementPrompt } = parsed.data;

    const { model, modelName } = getDynamicConfig();

    const prompt = `
      You are an expert polyglot programmer specializing in high-quality, maintainable code.

      Convert the following logic flowchart into idiomatic ${language} code.

      FLOWCHART DATA:
      Nodes: ${JSON.stringify(nodes)}
      Edges: ${JSON.stringify(edges)}

      CONVERSION PREFERENCES:
      - Coding Style: ${codingStyle || 'Standard/Idiomatic'}
      - Custom Instructions: ${refinementPrompt || 'None'}

      STRICT RULES:
      1. Interpret 'rectangle' as logic steps or function calls.
      2. Interpret 'diamond' as if/else or switch conditions (branching logic).
      3. Interpret 'parallelogram' as I/O operations.
      4. Interpret 'oval' as entry (Start) and exit (End) points.
      5. The output must be complete, syntactically perfect, and follow the specified ${codingStyle} style.
      6. If custom instructions are provided (${refinementPrompt}), prioritize them above all else.

      Return ONLY the raw source code. No markdown, no explanations.
    `;

    const result = await model.generateContent(prompt);
    const aiResponse = await result.response;
    let text = aiResponse.text().trim();

    if (text.startsWith("```")) {
      text = text.replace(/```[a-z]*|```/g, "").trim();
    }

    const jsonResponse = NextResponse.json({ code: text, modelUsed: modelName });
    return applyRateLimitHeaders(jsonResponse, rateLimitResult.remaining!, rateLimitResult.resetTime!);
  } catch (error: any) {
    console.error("Convert Error:", error);
    return NextResponse.json({
      error: "The logic-to-code synthesis engine encountered an error.",
      details: error?.message
    }, { status: 500 });
  }
}