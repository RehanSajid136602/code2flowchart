import { NextResponse } from "next/server";
import { getDynamicConfig } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { nodes, edges, language } = await req.json();

    if (!nodes || !language) {
      return NextResponse.json({ error: "Nodes and language are required" }, { status: 400 });
    }

    const { model, modelName } = getDynamicConfig();

    const prompt = `
      You are an expert polyglot programmer. 
      Convert the following logic flowchart (represented as nodes and edges) into idiomatic ${language} code.

      FLOWCHART DATA:
      Nodes: ${JSON.stringify(nodes)}
      Edges: ${JSON.stringify(edges)}

      RULES:
      1. Interpret 'rectangle' as logic steps or function calls.
      2. Interpret 'diamond' as if/else or switch conditions.
      3. Interpret 'parallelogram' as I/O (e.g., console.log, input()).
      4. Interpret 'oval' as entry/exit points.
      5. The code should be complete, syntactically correct, and perform the logic described by the connections.

      Return ONLY the code. No markdown formatting, no explanations.
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