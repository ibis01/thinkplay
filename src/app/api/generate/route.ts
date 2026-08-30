import { NextResponse } from "next/server";
import { generateAIResponse } from "@/lib/ai-provider";

const MAX_PROMPT_LENGTH = 2000;
const TIMEOUT_MS = 30000; // 30 seconds hard limit

export async function POST(request: Request) {
  try {
    // 1. Input Validation
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

    // 2. Create a timeout controller
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => timeoutController.abort(), TIMEOUT_MS);

    // 3. Link client abort to timeout abort
    request.signal.addEventListener("abort", () => {
      timeoutController.abort();
      clearTimeout(timeoutId);
    });

    // 4. Call AI Provider with combined signal
    const result = await generateAIResponse(
      prompt.trim(),
      timeoutController.signal,
    );
    clearTimeout(timeoutId);

    if (result.success) {
      return NextResponse.json({ response: result.response });
    } else {
      // Distinguish timeout/cancellation from provider failure
      if (result.error === "Timeout" || result.error === "Request cancelled") {
        return NextResponse.json(
          { error: "The request took too long or was cancelled." },
          { status: 408 },
        );
      }
      return NextResponse.json(
        { error: "Failed to generate response." },
        { status: 500 },
      );
    }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { error: "Request cancelled or timed out." },
        { status: 408 },
      );
    }
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
