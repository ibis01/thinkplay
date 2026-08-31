import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useThinkPlayStore } from "./thinkplayStore";

// Mock global fetch
global.fetch = vi.fn();

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
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ response: "Mocked AI response" }),
    });

    const { submitRequest } = useThinkPlayStore.getState();
    await submitRequest("Test prompt");

    expect(useThinkPlayStore.getState().state).toBe("TRANSITIONING");
    expect(useThinkPlayStore.getState().aiResponse).toBe("Mocked AI response");

    vi.advanceTimersByTime(600);
    expect(useThinkPlayStore.getState().state).toBe("RESPONSE_DISPLAYED");
  });

  it("should transition to ERROR state on API failure", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: () =>
        Promise.resolve({ code: "PROVIDER_ERROR", message: "Failed" }),
    });

    const { submitRequest } = useThinkPlayStore.getState();
    await submitRequest("Test prompt");

    expect(useThinkPlayStore.getState().state).toBe("ERROR");
    expect(useThinkPlayStore.getState().errorMessage).toBe(
      "We couldn't generate a response. Please try again.",
    );
  });

  it("should reset to IDLE state cleanly", () => {
    useThinkPlayStore.setState({
      state: "ERROR",
      currentPrompt: "test",
      category: "general",
      topic: "general",
      aiResponse: "test",
      errorMessage: "test",
      currentRequestId: "123",
      abortController: new AbortController(),
      transitionTimerId: setTimeout(() => {}, 1000),
    });

    useThinkPlayStore.getState().reset();

    const state = useThinkPlayStore.getState();
    expect(state.state).toBe("IDLE");
    expect(state.currentPrompt).toBe("");
    expect(state.category).toBeNull();
    expect(state.topic).toBeNull();
    expect(state.aiResponse).toBeNull();
    expect(state.errorMessage).toBeNull();
    expect(state.currentRequestId).toBeNull();
    expect(state.abortController).toBeNull();
    expect(state.transitionTimerId).toBeNull();
  });

  // NEW INTEGRATION TEST: Proves the runtime path from prompt to state
  it("should update category and topic in state based on classifier output (Integration)", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ response: "React hooks are functions..." }),
    });

    const { submitRequest } = useThinkPlayStore.getState();

    // 1. Submit a prompt that the classifier will identify as React
    await submitRequest("Explain React hooks");

    const state = useThinkPlayStore.getState();

    // 2. Prove the classifier extracted the correct context
    expect(state.category).toBe("coding");
    expect(state.topic).toBe("react");

    // 3. Prove the AI response is available immediately (AI Priority Rule)
    expect(state.aiResponse).toBe("React hooks are functions...");
    expect(state.state).toBe("TRANSITIONING");
  });
});
