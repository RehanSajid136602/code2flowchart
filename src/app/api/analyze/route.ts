import { NextResponse } from "next/server";
import { getDynamicConfig } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { nodes, edges } = await req.json();

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