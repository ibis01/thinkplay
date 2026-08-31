import { NextResponse } from "next/server";
import { generateAIResponse } from "@/lib/ai-provider";

const MAX_PROMPT_LENGTH = 2000;
const TIMEOUT_MS = 30000;

type ErrorCode =
  | "CLIENT_ABORT"
  | "TIMEOUT"
  | "VALIDATION_ERROR"
  | "PROVIDER_ERROR"
  | "RATE_LIMITED"
  | "NETWORK_ERROR"
  | "UNKNOWN_ERROR";

export async function POST(request: Request) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutController = new AbortController();

  const abortListener = () => {
    timeoutController.abort("client_abort");
    if (timeoutId) clearTimeout(timeoutId);
  };

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: "Invalid JSON payload." },
        { status: 400 },
      );
    }

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: "Invalid request payload." },
        { status: 400 },
      );
    }

    const prompt = (body as Record<string, unknown>).prompt;

    if (typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        {
          code: "VALIDATION_ERROR",
          message: "A valid text prompt is required.",
        },
        { status: 400 },
      );
    }

    if (prompt.length > MAX_PROMPT_LENGTH) {
      return NextResponse.json(
        {
          code: "VALIDATION_ERROR",
          message: `Prompt exceeds maximum length of ${MAX_PROMPT_LENGTH} characters.`,
        },
        { status: 400 },
      );
    }

    timeoutId = setTimeout(() => {
      timeoutController.abort("timeout");
    }, TIMEOUT_MS);

    request.signal.addEventListener("abort", abortListener);

    const result = await generateAIResponse(
      prompt.trim(),
      timeoutController.signal,
    );

    if (result.success) {
      return NextResponse.json({ response: result.response });
    } else {
      if (result.error === "timeout") {
        return NextResponse.json(
          { code: "TIMEOUT", message: "The request took too long to process." },
          { status: 408 },
        );
      }
      if (result.error === "client_abort") {
        return NextResponse.json(
          { code: "CLIENT_ABORT", message: "Request cancelled." },
          { status: 499 },
        );
      }
      return NextResponse.json(
        { code: "PROVIDER_ERROR", message: "Failed to generate response." },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { code: "UNKNOWN_ERROR", message: "Internal server error." },
      { status: 500 },
    );
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
    request.signal.removeEventListener("abort", abortListener);
  }
}
