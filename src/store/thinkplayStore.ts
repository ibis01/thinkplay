import { create } from "zustand";
import { LifecycleState, PromptCategory } from "@/types";
import { classifyIntent } from "@/lib/classifier";
import { generateAIResponse } from "@/lib/ai-provider";

interface ThinkPlayState {
  state: LifecycleState;
  currentPrompt: string;
  category: PromptCategory | null;
  aiResponse: string | null;
  errorMessage: string | null;
  currentRequestId: string | null;
  abortController: AbortController | null;
  submitRequest: (prompt: string) => Promise<void>;
  reset: () => void;
}

let transitionTimer: ReturnType<typeof setTimeout> | null = null;

export const useThinkPlayStore = create<ThinkPlayState>((set, get) => ({
  state: "IDLE",
  currentPrompt: "",
  category: null,
  aiResponse: null,
  errorMessage: null,
  currentRequestId: null,
  abortController: null,

  submitRequest: async (prompt: string) => {
    if (transitionTimer) clearTimeout(transitionTimer);

    const existingController = get().abortController;
    if (existingController) existingController.abort();

    const requestId = crypto.randomUUID();
    const controller = new AbortController();

    set({
      state: "REQUEST_STARTING",
      currentPrompt: prompt,
      category: null,
      aiResponse: null,
      errorMessage: null,
      currentRequestId: requestId,
      abortController: controller,
    });

    const category = classifyIntent(prompt);

    if (get().currentRequestId === requestId) {
      set({ state: "WAITING_ACTIVE", category });
    }

    try {
      const result = await generateAIResponse(prompt, controller.signal);

      if (!result.success) throw new Error(result.error || "Generation failed");

      if (get().currentRequestId === requestId) {
        set({ state: "TRANSITIONING", aiResponse: result.response });

        transitionTimer = setTimeout(() => {
          if (get().currentRequestId === requestId) {
            set({ state: "RESPONSE_DISPLAYED" });
          }
        }, 600);
      }
    } catch {
      if (get().currentRequestId === requestId) {
        set({
          state: "ERROR",
          errorMessage: "We couldn't generate your response. Please try again.",
        });
      }
    }
  },

  reset: () => {
    if (transitionTimer) clearTimeout(transitionTimer);
    const controller = get().abortController;
    if (controller) controller.abort();

    set({
      state: "IDLE",
      currentPrompt: "",
      category: null,
      aiResponse: null,
      errorMessage: null,
      currentRequestId: null,
      abortController: null,
    });
  },
}));
