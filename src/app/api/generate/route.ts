import { NextResponse } from "next/server";
import { generateAIResponse } from "@/lib/ai-provider";

const MAX_PROMPT_LENGTH = 2000;
const TIMEOUT_MS = 30000; // 30 seconds hard limit

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

    const timeoutController = new AbortController();
    const timeoutId = setTimeout(
      () => timeoutController.abort("timeout"),
      TIMEOUT_MS,
    );

    request.signal.addEventListener("abort", () => {
      timeoutController.abort("client_abort");
      clearTimeout(timeoutId);
    });

    const result = await generateAIResponse(
      prompt.trim(),
      timeoutController.signal,
    );
    clearTimeout(timeoutId);

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
    if (error instanceof Error && error.name === "AbortError") {
      // AbortController.abort(reason) stores the reason on the error
      const abortError = error as Error & { reason?: string };
      const reason = abortError.reason;

      if (reason === "timeout") {
        return NextResponse.json(
          { error: "The request took too long to process." },
          { status: 408 },
        );
      }

      // client_abort or any other abort reason
      return NextResponse.json(
        { error: "Request cancelled." },
        { status: 499 },
      );
    }
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
