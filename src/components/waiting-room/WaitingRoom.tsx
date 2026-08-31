"use client";

import { useThinkPlayStore } from "@/store/thinkplayStore";
import { resolveExperience } from "@/lib/experience-resolver";
import CodeBreaker from "@/components/experiences/CodeBreaker";
import PromptPainter from "@/components/experiences/PromptPainter";
import ThinkFast from "@/components/experiences/ThinkFast";
import { motion, AnimatePresence } from "framer-motion";

export default function WaitingRoom() {
  const { state, category, topic } = useThinkPlayStore();
  const isFinishing = state === "TRANSITIONING";

  const experienceConfig =
    topic && category ? resolveExperience({ category, topic }) : null;

  if (state !== "WAITING_ACTIVE" && state !== "TRANSITIONING") return null;
  if (!experienceConfig) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={experienceConfig.theme}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-md mx-auto"
      >
        {category === "coding" && (
          <CodeBreaker isFinishing={isFinishing} config={experienceConfig} />
        )}
        {category === "creative" && (
          <PromptPainter isFinishing={isFinishing} config={experienceConfig} />
        )}
        {category === "general" && (
          <ThinkFast isFinishing={isFinishing} config={experienceConfig} />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
