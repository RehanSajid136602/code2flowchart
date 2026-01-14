import { NextResponse } from "next/server";
import { getDynamicConfig } from "@/lib/gemini";
import { ExplainRequestSchema } from "@/validators/aiRequestsSchema";
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
    const parsed = ExplainRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    const { nodeLabel, nodeType } = parsed.data;
    const { model, modelName } = getDynamicConfig();

    const prompt = `
      Explain the following flowchart component using simple language from an FBISE Computer Science textbook (Grade 9-12).
      Component: ${nodeLabel} (${nodeType})

      Keep it under 3 sentences. Use analogies if helpful.
      Return ONLY explanation text.
    `;

    const result = await model.generateContent(prompt);
    const aiResponse = await result.response;
    const jsonResponse = NextResponse.json({
      explanation: aiResponse.text().trim(),
      modelUsed: modelName
    });
    return applyRateLimitHeaders(jsonResponse, rateLimitResult.remaining!, rateLimitResult.resetTime!);
  } catch (error: any) {
    console.error("Explain Error:", error);
    return NextResponse.json({
      error: "The logic explanation engine encountered a failure.",
      details: error?.message
    }, { status: 500 });
  }
}