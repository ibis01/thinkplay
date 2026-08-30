import { create } from "zustand";
import { LifecycleState, PromptCategory } from "@/types";
import { classifyIntent } from "@/lib/classifier";

interface ThinkPlayState {
  state: LifecycleState;
  currentPrompt: string;
  category: PromptCategory | null;
  topic: string | null; // NEW
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
  topic: null, // NEW
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
      topic: null, // NEW
      aiResponse: null,
      errorMessage: null,
      currentRequestId: requestId,
      abortController: controller,
      transitionTimerId: null,
    });

    // Extract context instantly
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

      if (!response.ok) throw new Error("Generation failed");
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
    } catch {
      if (controller.signal.aborted) return;

      if (get().currentRequestId === requestId) {
        set({
          state: "ERROR",
          errorMessage: "We couldn't generate your response. Please try again.",
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
      topic: null, // NEW
      aiResponse: null,
      errorMessage: null,
      currentRequestId: null,
      abortController: null,
      transitionTimerId: null,
    });
  },
}));
