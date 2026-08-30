import { create } from "zustand";
import { LifecycleState, PromptCategory } from "@/types";

interface ThinkPlayState {
  state: LifecycleState;
  currentPrompt: string;
  category: PromptCategory | null;
  aiResponse: string | null;
  errorMessage: string | null;
  submitRequest: (prompt: string) => Promise<void>;
  reset: () => void;
}

export const useThinkPlayStore = create<ThinkPlayState>((set, get) => ({
  state: "IDLE",
  currentPrompt: "",
  category: null,
  aiResponse: null,
  errorMessage: null,

  submitRequest: async (prompt: string) => {
    set({
      state: "REQUEST_STARTING",
      currentPrompt: prompt,
      category: null,
      aiResponse: null,
      errorMessage: null,
    });

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    };

    // Fire classification — updates state independently when it resolves
    const classifyPromise = fetch("/api/classify", requestOptions)
      .then((r) => r.json())
      .then((d) => {
        const cat = (d.category as PromptCategory) || "general";
        // Only update if we're still waiting for classification
        if (get().state === "REQUEST_STARTING") {
          set({ state: "WAITING_ACTIVE", category: cat });
        }
        return cat;
      })
      .catch(() => {
        if (get().state === "REQUEST_STARTING") {
          set({ state: "WAITING_ACTIVE", category: "general" });
        }
        return "general" as PromptCategory;
      });

    // Fire generation — awaited to handle response/error
    const generatePromise = fetch("/api/generate", requestOptions)
      .then((r) => {
        if (!r.ok) throw new Error("Generation failed");
        return r.json();
      })
      .then((d) => d.response as string);

    try {
      const response = await generatePromise;
      const currentCategory = get().category || "general";
      set({
        state: "TRANSITIONING",
        aiResponse: response,
        category: currentCategory,
      });
      setTimeout(() => {
        set({ state: "RESPONSE_DISPLAYED" });
      }, 600);
    } catch {
      set({
        state: "ERROR",
        errorMessage: "We couldn't generate your response. Please try again.",
      });
    }

    // Ensure classify promise doesn't produce unhandled rejection
    classifyPromise.catch(() => {});
  },

  reset: () => {
    set({
      state: "IDLE",
      currentPrompt: "",
      category: null,
      aiResponse: null,
      errorMessage: null,
    });
  },
}));
