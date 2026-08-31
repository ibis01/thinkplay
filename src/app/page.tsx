"use client";

import { useState } from "react";
import { useThinkPlayStore } from "@/store/thinkplayStore";
import { resolveExperience } from "@/lib/experience-resolver";
import CodeBreaker from "@/components/experiences/CodeBreaker";
import ThinkFast from "@/components/experiences/ThinkFast";
import PromptPainter from "@/components/experiences/PromptPainter";
import { Send, RefreshCw, Sparkles } from "lucide-react";

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const {
    state,
    category,
    topic,
    aiResponse,
    errorMessage,
    submitRequest,
    reset,
  } = useThinkPlayStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      submitRequest(inputValue.trim());
      setInputValue("");
    }
  };

  const experienceConfig =
    topic && category ? resolveExperience({ category, topic }) : null;

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            ThinkPlay
          </h1>
          <p className="text-sm text-gray-400">
            Transforming AI waiting time into meaningful interaction.
          </p>
        </header>

        <div className="min-h-[400px] flex flex-col justify-center">
          {state === "IDLE" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask the AI anything (e.g., 'Fix my React bug' or 'Write a poem about Mars')..."
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  aria-label="Enter your prompt"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-800 disabled:text-gray-500 rounded-lg transition-colors"
                  aria-label="Submit prompt"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {(state === "REQUEST_STARTING" || state === "WAITING_ACTIVE") &&
            experienceConfig && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">
                    {state === "REQUEST_STARTING"
                      ? "Initializing..."
                      : "While the AI thinks..."}
                  </p>
                  {experienceConfig.theme !== "general" && (
                    <p className="text-xs text-purple-400 font-mono">
                      {experienceConfig.description}
                    </p>
                  )}
                </div>

                {category === "coding" && (
                  <CodeBreaker
                    isFinishing={false}
                    config={experienceConfig}
                    key={experienceConfig.theme}
                  />
                )}
                {category === "creative" && (
                  <PromptPainter
                    isFinishing={false}
                    config={experienceConfig}
                    key={experienceConfig.theme}
                  />
                )}
                {category === "general" && (
                  <ThinkFast
                    isFinishing={false}
                    config={experienceConfig}
                    key={experienceConfig.theme}
                  />
                )}
              </div>
            )}

          {(state === "TRANSITIONING" || state === "RESPONSE_DISPLAYED") && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-purple-400">
                  <Sparkles className="w-5 h-5" />
                  <h2 className="font-semibold">AI Response</h2>
                </div>
                <div className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                  {aiResponse}
                </div>
              </div>
              <button
                onClick={reset}
                className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Ask Another Question
              </button>
            </div>
          )}

          {state === "ERROR" && (
            <div className="space-y-6 text-center animate-in fade-in duration-300">
              <div className="bg-red-900/20 border border-red-900/50 rounded-xl p-6">
                <p className="text-red-400 font-medium">{errorMessage}</p>
              </div>
              <button
                onClick={reset}
                className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
