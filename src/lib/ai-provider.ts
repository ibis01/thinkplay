import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function generateAIResponse(prompt: string, signal?: AbortSignal) {
  try {
    const result = await generateText({
      model: openrouter("qwen/qwen-2.5-72b-instruct:free"),
      prompt: `You are ThinkPlay AI. Provide a concise, helpful response. Keep it under 150 words. User request: "${prompt}"`,
      temperature: 0.7,
      abortSignal: signal,
    });

    return { success: true, response: result.text };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      // Check the signal's reason directly for absolute accuracy
      const reason = signal?.reason;
      const errorReason = reason === "timeout" ? "timeout" : "client_abort";

      return { success: false, error: errorReason };
    }
    console.error("AI Provider Error:", error);
    return { success: false, error: "Failed to generate response." };
  }
}
