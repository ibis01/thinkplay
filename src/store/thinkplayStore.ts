import { create } from "zustand";
import { LifecycleState, PromptCategory } from "@/types";
import { classifyPrompt } from "@/lib/classifier";

interface ThinkPlayState {
  state: LifecycleState;
  currentPrompt: string;
  category: PromptCategory | null;
  aiResponse: string | null;
  errorMessage: string | null;
  submitRequest: (prompt: string) => Promise<void>;
  reset: () => void;
}

export const useThinkPlayStore = create<ThinkPlayState>((set) => ({
  state: "IDLE",
  currentPrompt: "",
  category: null,
  aiResponse: null,
  errorMessage: null,

  submitRequest: async (prompt: string) => {
    const category = classifyPrompt(prompt);

    set({
      state: "CLASSIFYING",
      currentPrompt: prompt,
      category,
      aiResponse: null,
      errorMessage: null,
    });

    await new Promise((resolve) => setTimeout(resolve, 300));
    set({ state: "WAITING_ACTIVE" });

    try {
      // 🌟 THE PRO-MOVE: Run the AI request and a 3.5s timer in parallel.
      // This guarantees the user has time to play the mini-game!
      const [apiResult] = await Promise.all([
        fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        }),
        new Promise((resolve) => setTimeout(resolve, 3500)), // Minimum 3.5s play time
      ]);

      if (!apiResult.ok) {
        throw new Error("AI generation failed");
      }

      const data = await apiResult.json();

      set({ state: "TRANSITIONING_TO_RESPONSE", aiResponse: data.response });

      setTimeout(() => {
        set({ state: "RESPONSE_DISPLAYED" });
      }, 800);
    } catch (error) {
      console.error("AI Request Error:", error);
      set({
        state: "ERROR",
        errorMessage:
          "Failed to generate response. Did you add your GROQ_API_KEY to .env.local?",
      });
    }
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
