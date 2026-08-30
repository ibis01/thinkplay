import { NextResponse } from "next/server";
import { classifyIntent } from "@/lib/ai-provider";

const MAX_PROMPT_LENGTH = 2000;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request payload." },
        { status: 400 },
      );
    }

    const prompt = body.prompt;

    if (typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "A valid text prompt is required." },
        { status: 400 },
      );
    }

    if (prompt.length > MAX_PROMPT_LENGTH) {
      return NextResponse.json(
        {
          error: `Prompt exceeds maximum length of ${MAX_PROMPT_LENGTH} characters.`,
        },
        { status: 400 },
      );
    }

    const category = await classifyIntent(prompt.trim());
    return NextResponse.json({ category });
  } catch (error) {
    console.error("Classify Route Error:", error);
    return NextResponse.json({ category: "general" }, { status: 200 });
  }
}
