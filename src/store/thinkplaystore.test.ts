import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useThinkPlayStore } from "./thinkplayStore";

global.fetch = vi.fn();

describe("ThinkPlay Store", () => {
  beforeEach(() => {
    useThinkPlayStore.getState().reset();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should transition to RESPONSE_DISPLAYED immediately on success", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ response: "Mocked AI response" }),
    });

    const { submitRequest } = useThinkPlayStore.getState();
    await submitRequest("Test prompt");

    expect(useThinkPlayStore.getState().state).toBe("RESPONSE_DISPLAYED");
    expect(useThinkPlayStore.getState().aiResponse).toBe("Mocked AI response");
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
  });

  it("should update category and topic in state based on classifier output (Integration)", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ response: "React hooks are functions..." }),
    });

    const { submitRequest } = useThinkPlayStore.getState();
    await submitRequest("Explain React hooks");

    const state = useThinkPlayStore.getState();
    expect(state.category).toBe("coding");
    expect(state.topic).toBe("react");
    expect(state.aiResponse).toBe("React hooks are functions...");
    expect(state.state).toBe("RESPONSE_DISPLAYED");
  });
});
