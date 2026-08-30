import { streamText, generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import type { PromptCategory } from "@/types";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

function parseCategory(text: string): PromptCategory {
  const normalized = text
    .trim()
    .toLowerCase()
    .replace(/["'\s]/g, "");
  if (normalized.includes("coding")) return "coding";
  if (normalized.includes("creative")) return "creative";
  return "general";
}

function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  fallback: T,
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

export async function classifyIntent(prompt: string): Promise<PromptCategory> {
  try {
    const classifyPromise = generateText({
      model: openrouter("qwen/qwen-2.5-72b-instruct:free"),
      system: `You are a prompt classifier. Classify the user's intent into exactly one category: "coding", "creative", or "general".
- coding: programming, debugging, code review, technical implementation, software engineering
- creative: writing, art, design, storytelling, poetry, music, visual ideas
- general: everything else (questions, explanations, analysis, learning, math, advice)
Respond with ONLY the category word. Nothing else.`,
      prompt,
      temperature: 0,
    }).then((result) => result.text);

    const text = await withTimeout(classifyPromise, 10000, "");
    return parseCategory(text);
  } catch (error) {
    console.error("Classification error:", error);
    return "general";
  }
}

export async function generateAIResponse(prompt: string) {
  try {
    const result = await streamText({
      model: openrouter("qwen/qwen-2.5-72b-instruct:free"),
      prompt: `You are ThinkPlay AI. Provide a concise, helpful response. Keep it under 100 words. User request: "${prompt}"`,
      temperature: 0.7,
    });

    // Wrap the stream consumption in a timeout to prevent infinite hanging
    const streamPromise = (async () => {
      let fullText = "";
      for await (const chunk of result.textStream) {
        fullText += chunk;
      }
      return fullText;
    })();

    const fullText = await withTimeout(streamPromise, 30000, "");

    if (!fullText) {
      return { success: false, error: "Response timed out." };
    }

    return { success: true, response: fullText };
  } catch (error) {
    console.error("AI Provider Error:", error);
    return { success: false, error: "Failed to generate response." };
  }
}
