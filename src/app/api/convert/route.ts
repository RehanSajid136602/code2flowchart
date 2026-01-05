import { NextResponse } from "next/server";
import { getDynamicConfig } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { nodes, edges, language, codingStyle, refinementPrompt } = await req.json();

    if (!nodes || !language) {
      return NextResponse.json({ error: "Nodes and language are required" }, { status: 400 });
    }

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
    const response = await result.response;
    let text = response.text().trim();

    if (text.startsWith("```")) {
      text = text.replace(/```[a-z]*|```/g, "").trim();
    }

    return NextResponse.json({ code: text, modelUsed: modelName });
  } catch (error: any) {
    console.error("Convert Error:", error);
    return NextResponse.json({
      error: error.message || "Failed to convert logic",
      type: error.name || "Error"
    }, { status: 500 });
  }
}