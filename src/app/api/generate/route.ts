import { NextResponse } from "next/server";
import { generateAIResponse } from "@/lib/ai-provider";

const MAX_PROMPT_LENGTH = 2000;
const TIMEOUT_MS = 30000; // 30 seconds hard limit

export async function POST(request: Request) {
  try {
    // 1. Safely parse JSON without using 'any'
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload." },
        { status: 400 },
      );
    }

    // 2. Validate payload structure
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Invalid request payload." },
        { status: 400 },
      );
    }

    const prompt = (body as Record<string, unknown>).prompt;

    // 3. Validate prompt specifically
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

    // 4. Create timeout controller with explicit reason
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => {
      timeoutController.abort("timeout");
    }, TIMEOUT_MS);

    // 5. Link client abort to timeout abort
    request.signal.addEventListener("abort", () => {
      timeoutController.abort("client_abort");
      clearTimeout(timeoutId);
    });

    // 6. Call AI Provider with combined signal
    const result = await generateAIResponse(
      prompt.trim(),
      timeoutController.signal,
    );
    clearTimeout(timeoutId);

    // 7. Map provider's structured result to HTTP response
    if (result.success) {
      return NextResponse.json({ response: result.response });
    } else {
      if (result.error === "timeout") {
        return NextResponse.json(
          { error: "The request took too long to process." },
          { status: 408 },
        );
      }
      if (result.error === "client_abort") {
        return NextResponse.json(
          { error: "Request cancelled." },
          { status: 499 },
        );
      }
      return NextResponse.json(
        { error: "Failed to generate response." },
        { status: 500 },
      );
    }
  } catch (error) {
    // Fallback for unexpected, non-abort errors
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
