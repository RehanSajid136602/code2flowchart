import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

type Provider = "gemini" | "groq";
type Mode = Provider | "hybrid";

type GenerateContentResult = {
  response: {
    text(): string;
  };
};

export type DynamicModel = {
  generateContent(prompt: string): Promise<GenerateContentResult>;
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getEnvList(name: string): string[] {
  const raw = process.env[name];
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const DEFAULT_GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-2.5-flash-lite",
];

// Locked Groq model (per request)
const GROQ_MODEL = "groq/compound";

function getGeminiModel() {
  const apiKeys = getEnvList("GOOGLE_GENERATIVE_AI_API_KEYS");
  if (apiKeys.length === 0) {
    throw new Error(
      "Missing GOOGLE_GENERATIVE_AI_API_KEYS env var (comma-separated keys)"
    );
  }

  const models = getEnvList("GEMINI_MODELS");
  const modelName = pickRandom(models.length ? models : DEFAULT_GEMINI_MODELS);
  const apiKey = pickRandom(apiKeys);

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });

  // Gemini SDK already matches the `generateContent()` shape used in routes.
  return {
    model: model as unknown as DynamicModel,
    modelName,
    provider: "gemini" as const,
  };
}

function getGroqModel() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GROQ_API_KEY env var");
  }

  const modelName = GROQ_MODEL;
  const groq = new Groq({ apiKey });

  const model: DynamicModel = {
    async generateContent(prompt: string) {
      const completion = await groq.chat.completions.create({
        model: modelName,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
      });

      const content = completion.choices?.[0]?.message?.content ?? "";

      // Adapt Groq response to match the Gemini calling convention used in API routes.
      return {
        response: {
          text: () => (typeof content === "string" ? content : String(content)),
        },
      };
    },
  };

  return { model, modelName, provider: "groq" as const };
}

/**
 * Returns a model wrapper compatible with existing API routes.
 *
 * Modes:
 * - "gemini": always Gemini
 * - "groq": always Groq
 * - "hybrid" (default): randomly chooses between Gemini and Groq (based on available env vars)
 */
export function getDynamicConfig(mode: Mode = "hybrid") {
  const hasGemini = getEnvList("GOOGLE_GENERATIVE_AI_API_KEYS").length > 0;
  const hasGroq = !!process.env.GROQ_API_KEY;

  if (mode === "gemini") return getGeminiModel();
  if (mode === "groq") return getGroqModel();

  // Hybrid
  const available: Provider[] = [];
  if (hasGemini) available.push("gemini");
  if (hasGroq) available.push("groq");

  if (available.length === 0) {
    throw new Error(
      "No AI providers configured. Set GOOGLE_GENERATIVE_AI_API_KEYS and/or GROQ_API_KEY"
    );
  }

  const provider = pickRandom(available);
  return provider === "gemini" ? getGeminiModel() : getGroqModel();
}
