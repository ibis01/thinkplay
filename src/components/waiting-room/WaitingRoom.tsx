"use client";

import { motion } from "framer-motion";
import { useThinkPlayStore } from "@/store/thinkplayStore";
import { Sparkles, Code, Palette, Brain, Loader2 } from "lucide-react";
import CodeBreaker from "@/components/experiences/CodeBreaker";
import PromptPainter from "@/components/experiences/PromptPainter";
import ThinkFast from "@/components/experiences/ThinkFast";

export default function WaitingRoom() {
  const { state, category } = useThinkPlayStore();

  if (
    state !== "REQUEST_STARTING" &&
    state !== "WAITING_ACTIVE" &&
    state !== "TRANSITIONING"
  )
    return null;

  const isDetecting = state === "REQUEST_STARTING";
  const isFinishing = state === "TRANSITIONING";

  const getCategoryIcon = () => {
    switch (category) {
      case "coding":
        return <Code className="w-6 h-6 text-blue-400" />;
      case "creative":
        return <Palette className="w-6 h-6 text-pink-400" />;
      default:
        return <Brain className="w-6 h-6 text-purple-400" />;
    }
  };

  const getCategoryLabel = () => {
    switch (category) {
      case "coding":
        return "Code Breaker Mode";
      case "creative":
        return "Prompt Painter Mode";
      default:
        return "Think Fast Mode";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{
        opacity: isFinishing ? 0 : 1,
        y: isFinishing ? -20 : 0,
        scale: isFinishing ? 0.95 : 1,
      }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="w-full max-w-md mx-auto bg-gray-950 border border-gray-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-purple-600/10 blur-3xl rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center space-y-5">
        <div className="space-y-2">
          <motion.div
            animate={
              isFinishing
                ? {}
                : isDetecting
                  ? { rotate: 360 }
                  : { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }
            }
            transition={
              isDetecting
                ? { duration: 1, repeat: Infinity, ease: "linear" }
                : { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }
            className="p-3 bg-gray-900 rounded-full border border-gray-800 inline-flex"
          >
            {isDetecting ? (
              <Loader2 className="w-6 h-6 text-purple-400" />
            ) : (
              getCategoryIcon()
            )}
          </motion.div>
          <h3 className="text-lg font-bold text-white flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            {isDetecting ? "Detecting Context" : "AI is Thinking"}
          </h3>
          {!isDetecting && (
            <p className="text-xs text-gray-400">
              Detected:{" "}
              <span className="text-purple-400 font-semibold">
                {getCategoryLabel()}
              </span>
            </p>
          )}
        </div>

        {!isDetecting && (
          <div className="w-full">
            {category === "coding" ? (
              <CodeBreaker isFinishing={isFinishing} />
            ) : category === "creative" ? (
              <PromptPainter isFinishing={isFinishing} />
            ) : (
              <ThinkFast isFinishing={isFinishing} />
            )}
          </div>
        )}

        <motion.div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ x: "-100%" }}
            animate={isFinishing ? { x: "0%" } : { x: "100%" }}
            transition={{
              duration: isFinishing ? 0.6 : 2,
              repeat: isFinishing ? 0 : Infinity,
              ease: "linear",
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
