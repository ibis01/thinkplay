import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useThinkPlayStore } from "./thinkplayStore";
import * as aiProvider from "@/lib/ai-provider";

// Mock the AI provider module
vi.mock("@/lib/ai-provider", () => ({
  generateAIResponse: vi.fn(),
}));

describe("ThinkPlay Store", () => {
  beforeEach(() => {
    useThinkPlayStore.getState().reset();
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should transition through states correctly on success", async () => {
    // Mock successful AI response
    vi.mocked(aiProvider.generateAIResponse).mockResolvedValueOnce({
      success: true,
      response: "Mocked AI response",
    });

    const { submitRequest } = useThinkPlayStore.getState();

    // 1. Initial state
    expect(useThinkPlayStore.getState().state).toBe("IDLE");

    // 2. Trigger request
    const requestPromise = submitRequest("Test prompt");

    // Note: Because classifyIntent is now synchronous, the state
    // may instantly be WAITING_ACTIVE by the time we check it.
    // We will await the promise and check the pre-transition state.
    await requestPromise;

    // 3. After generation resolves, it should be TRANSITIONING
    expect(useThinkPlayStore.getState().state).toBe("TRANSITIONING");
    expect(useThinkPlayStore.getState().aiResponse).toBe("Mocked AI response");

    // 4. Fast-forward the 600ms animation delay
    vi.advanceTimersByTime(600);

    // 5. Check final state
    expect(useThinkPlayStore.getState().state).toBe("RESPONSE_DISPLAYED");
  });

  it("should transition to ERROR state on API failure", async () => {
    // Mock failed AI response
    vi.mocked(aiProvider.generateAIResponse).mockResolvedValueOnce({
      success: false,
      error: "Generation failed",
    });

    const { submitRequest } = useThinkPlayStore.getState();

    await submitRequest("Test prompt");

    // Check error state
    expect(useThinkPlayStore.getState().state).toBe("ERROR");
    expect(useThinkPlayStore.getState().errorMessage).toBe(
      "We couldn't generate your response. Please try again.",
    );

    // CRITICAL CHECK: Ensure no secrets are leaked
    expect(useThinkPlayStore.getState().errorMessage).not.toContain("API_KEY");
    expect(useThinkPlayStore.getState().errorMessage).not.toContain(".env");
  });

  it("should reset to IDLE state cleanly", () => {
    const { reset } = useThinkPlayStore.getState();

    // Manually set to error state first with all properties
    useThinkPlayStore.setState({
      state: "ERROR",
      currentPrompt: "test",
      category: "general",
      aiResponse: "test",
      errorMessage: "test",
      currentRequestId: "123",
      abortController: new AbortController(),
    });

    // Reset
    reset();

    const state = useThinkPlayStore.getState();
    expect(state.state).toBe("IDLE");
    expect(state.currentPrompt).toBe("");
    expect(state.category).toBeNull();
    expect(state.aiResponse).toBeNull();
    expect(state.errorMessage).toBeNull();
    expect(state.currentRequestId).toBeNull();
    expect(state.abortController).toBeNull();
  });
});
