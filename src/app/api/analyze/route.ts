import { NextResponse } from "next/server";
import { getDynamicConfig } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { nodes, edges } = await req.json();

    const { model, modelName } = getDynamicConfig();

    const prompt = `
      Analyze this flowchart for logical bugs (dead ends, infinite loops, unreachable nodes).
      Nodes: ${JSON.stringify(nodes)}
      Edges: ${JSON.stringify(edges)}

      Return a JSON object:
      {
        "bugNodeIds": ["id1", "id2"],
        "analysis": "Brief explanation of bugs",
        "complexity": {"time": "O(n)", "space": "O(1)"}
      }
      Return ONLY the JSON.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    if (text.startsWith("```json")) text = text.replace(/```json|```/g, "").trim();

    try {
      const parsed = JSON.parse(text);
      return NextResponse.json({ ...parsed, modelUsed: modelName });
    } catch (e: any) {
      return NextResponse.json({ error: "Invalid AI response", details: e.message, raw: text }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Analysis Error:", error);
    return NextResponse.json({ 
      error: error.message || "Analysis failed",
      type: error.name || "Error"
    }, { status: 500 });
  }
}