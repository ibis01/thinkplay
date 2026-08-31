import { PromptCategory } from "@/types";

export interface ExperienceConfig {
  theme: string;
  description: string;
}

// Deterministic experience resolver map
export const TOPIC_EXPERIENCE_MAP: Record<string, ExperienceConfig> = {
  react: { theme: "coding", description: "Debug a React component" },
  python: { theme: "coding", description: "Fix a Python script" },
  javascript: { theme: "coding", description: "Debug JavaScript code" },
  space: { theme: "general", description: "Identify space objects" },
  cooking: { theme: "general", description: "Match cooking ingredients" },
  music: { theme: "creative", description: "Identify musical elements" },
};

export function resolveExperience(
  topic: string,
  category: PromptCategory,
): ExperienceConfig {
  const config = TOPIC_EXPERIENCE_MAP[topic];
  if (config) return config;

  // Fallback to category-based default
  return {
    theme: category,
    description:
      category === "coding"
        ? "Find the bug"
        : category === "creative"
          ? "Create something"
          : "Find the odd one out",
  };
}
