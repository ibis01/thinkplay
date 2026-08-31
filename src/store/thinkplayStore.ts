import { create } from "zustand";
import { LifecycleState, PromptCategory } from "@/types";
import { classifyIntent } from "@/lib/classifier";

const ERROR_CODE_MAP: Record<string, string> = {
  TIMEOUT: "The response took too long. Please try again.",
  VALIDATION_ERROR: "Invalid input. Please check your prompt and try again.",
  PROVIDER_ERROR: "We couldn't generate a response. Please try again.",
  RATE_LIMITED: "Too many requests. Please wait a moment and try again.",
  NETWORK_ERROR: "Network issue. Please check your connection and try again.",
  UNKNOWN_ERROR: "Something went wrong. Please try again.",
};

interface ThinkPlayState {
  state: LifecycleState;
  currentPrompt: string;
  category: PromptCategory | null;
  topic: string | null;
  aiResponse: string | null;
  errorMessage: string | null;
  currentRequestId: string | null;
  abortController: AbortController | null;
  transitionTimerId: ReturnType<typeof setTimeout> | null;
  submitRequest: (prompt: string) => Promise<void>;
  reset: () => void;
}

export const useThinkPlayStore = create<ThinkPlayState>((set, get) => ({
  state: "IDLE",
  currentPrompt: "",
  category: null,
  topic: null,
  aiResponse: null,
  errorMessage: null,
  currentRequestId: null,
  abortController: null,
  transitionTimerId: null,

  submitRequest: async (prompt: string) => {
    const existingController = get().abortController;
    if (existingController) existingController.abort();

    const existingTimer = get().transitionTimerId;
    if (existingTimer) clearTimeout(existingTimer);

    const requestId = crypto.randomUUID();
    const controller = new AbortController();

    set({
      state: "REQUEST_STARTING",
      currentPrompt: prompt,
      category: null,
      topic: null,
      aiResponse: null,
      errorMessage: null,
      currentRequestId: requestId,
      abortController: controller,
      transitionTimerId: null,
    });

    const context = classifyIntent(prompt);
    if (get().currentRequestId === requestId) {
      set({
        state: "WAITING_ACTIVE",
        category: context.category,
        topic: context.topic,
      });
    }

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
        signal: controller.signal,
      });

      if (!response.ok) {
        let safeError = "We couldn't generate your response. Please try again.";
        try {
          const errData = await response.json();
          if (
            errData?.code &&
            typeof errData.code === "string" &&
            ERROR_CODE_MAP[errData.code]
          ) {
            safeError = ERROR_CODE_MAP[errData.code];
          } else if (errData?.message && typeof errData.message === "string") {
            if (
              !errData.message.includes("API_KEY") &&
              !errData.message.includes(".env")
            ) {
              safeError = errData.message;
            }
          }
        } catch {
          // Ignore parsing errors
        }
        throw new Error(safeError);
      }

      const data = await response.json();

      if (get().currentRequestId === requestId) {
        set({ state: "TRANSITIONING", aiResponse: data.response });

        const timerId = setTimeout(() => {
          if (get().currentRequestId === requestId) {
            set({ state: "RESPONSE_DISPLAYED", transitionTimerId: null });
          }
        }, 600);

        set({ transitionTimerId: timerId });
      }
    } catch (error) {
      if (controller.signal.aborted) return;

      if (get().currentRequestId === requestId) {
        set({
          state: "ERROR",
          errorMessage:
            error instanceof Error
              ? error.message
              : "We couldn't generate your response. Please try again.",
        });
      }
    }
  },

  reset: () => {
    const controller = get().abortController;
    if (controller) controller.abort();

    const timerId = get().transitionTimerId;
    if (timerId) clearTimeout(timerId);

    set({
      state: "IDLE",
      currentPrompt: "",
      category: null,
      topic: null,
      aiResponse: null,
      errorMessage: null,
      currentRequestId: null,
      abortController: null,
      transitionTimerId: null,
    });
  },
}));
