import { NextResponse } from "next/server";
import { getDynamicConfig } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { nodeLabel, nodeType } = await req.json();

    const { model, modelName } = getDynamicConfig();

    const prompt = `
      Explain the following flowchart component using simple language from an FBISE Computer Science textbook (Grade 9-12).
      Component: ${nodeLabel} (${nodeType})
      
      Keep it under 3 sentences. Use analogies if helpful.
      Return ONLY the explanation text.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return NextResponse.json({ 
      explanation: response.text().trim(),
      modelUsed: modelName 
    });
  } catch (error: any) {
    console.error("Explain Error:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to explain",
      type: error.name || "Error"
    }, { status: 500 });
  }
}