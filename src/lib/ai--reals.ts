import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

// Configure OpenRouter
const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function generateAIResponse(prompt: string) {
  try {
    const result = await streamText({
      model: openrouter("qwen/qwen-2.5-72b-instruct:free"),
      prompt: `You are ThinkPlay AI. Provide a concise, helpful response. Keep it under 100 words. User request: "${prompt}"`,
      temperature: 0.7,
    });

    let fullText = "";
    for await (const chunk of result.textStream) {
      fullText += chunk;
    }

    return { success: true, response: fullText };
  } catch (error) {
    console.error("AI Error:", error);
    return { success: false, error: "Failed to generate response." };
  }
}
