import { NextResponse } from "next/server";
import { generateAIResponse } from "@/lib/ai-reals";

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    console.log("🚀 API Route called with prompt:", prompt);

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 },
      );
    }

    const result = await generateAIResponse(prompt);
    console.log("✅ API Route result success:", result.success);

    if (result.success) {
      return NextResponse.json({ response: result.response });
    } else {
      console.error("❌ API Generation Failed:", result.error);
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error("❌ API Route Crash:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
