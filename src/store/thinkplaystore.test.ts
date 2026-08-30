import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useThinkPlayStore } from "./thinkplayStore";

// Mock global fetch
global.fetch = vi.fn();

describe("ThinkPlay Store", () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useThinkPlayStore.getState().reset();
    vi.clearAllMocks();
    vi.useFakeTimers(); // Enable fake timers for setTimeout
  });

  afterEach(() => {
    vi.useRealTimers(); // Restore real timers after each test
  });

  it("should transition through states correctly on success", async () => {
    // Mock fetch to handle BOTH classify and generate calls
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      (url: string) => {
        if (url === "/api/classify") {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ category: "coding" }),
          });
        }
        if (url === "/api/generate") {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ response: "Mocked AI response" }),
          });
        }
        return Promise.reject(new Error("Unknown URL"));
      },
    );

    const { submitRequest } = useThinkPlayStore.getState();

    // 1. Initial state
    expect(useThinkPlayStore.getState().state).toBe("IDLE");

    // 2. Trigger request
    const requestPromise = submitRequest("Test prompt");

    // 3. Check immediate transition
    expect(useThinkPlayStore.getState().state).toBe("REQUEST_STARTING");

    // Wait for the async fetch operations to complete
    await requestPromise;

    // 4. After fetch resolves, it should be in TRANSITIONING
    expect(useThinkPlayStore.getState().state).toBe("TRANSITIONING");
    expect(useThinkPlayStore.getState().aiResponse).toBe("Mocked AI response");

    // 5. Fast-forward the 600ms animation delay
    vi.advanceTimersByTime(600);

    // 6. Check final state
    expect(useThinkPlayStore.getState().state).toBe("RESPONSE_DISPLAYED");
  });

  it("should transition to ERROR state on API failure", async () => {
    // Mock fetch: classify succeeds, but generate fails
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      (url: string) => {
        if (url === "/api/classify") {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ category: "general" }),
          });
        }
        if (url === "/api/generate") {
          return Promise.resolve({
            ok: false, // Simulate server error
          });
        }
        return Promise.reject(new Error("Unknown URL"));
      },
    );

    const { submitRequest } = useThinkPlayStore.getState();

    // Trigger request
    await submitRequest("Test prompt");

    // Check error state
    expect(useThinkPlayStore.getState().state).toBe("ERROR");
    expect(useThinkPlayStore.getState().errorMessage).toBe(
      "We couldn't generate your response. Please try again.",
    );

    // CRITICAL CHECK: Ensure no secrets are leaked in the error message
    expect(useThinkPlayStore.getState().errorMessage).not.toContain("API_KEY");
    expect(useThinkPlayStore.getState().errorMessage).not.toContain(".env");
  });

  it("should reset to IDLE state cleanly", () => {
    const { reset } = useThinkPlayStore.getState();

    // Manually set to error state first
    useThinkPlayStore.setState({
      state: "ERROR",
      currentPrompt: "test",
      category: "general",
      aiResponse: "test",
      errorMessage: "test",
    });

    // Reset
    reset();

    const state = useThinkPlayStore.getState();
    expect(state.state).toBe("IDLE");
    expect(state.currentPrompt).toBe("");
    expect(state.category).toBeNull();
    expect(state.aiResponse).toBeNull();
    expect(state.errorMessage).toBeNull();
  });
});
