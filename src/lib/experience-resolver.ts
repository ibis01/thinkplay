import type { PromptCategory, PromptContext } from "@/types";

export type ExperienceTheme =
  | "react"
  | "python"
  | "javascript"
  | "space"
  | "cooking"
  | "music"
  | "general";

export interface ExperienceConfig {
  topic: string;
  category: PromptCategory;
  theme: ExperienceTheme;
  description: string;
}

const TOPIC_THEME_MAP: Record<string, ExperienceTheme> = {
  react: "react",
  python: "python",
  javascript: "javascript",
  js: "javascript",
  ts: "javascript",
  space: "space",
  mars: "space",
  nasa: "space",
  cooking: "cooking",
  recipe: "cooking",
  food: "cooking",
  music: "music",
  song: "music",
  guitar: "music",
};

const THEME_DESCRIPTIONS: Record<ExperienceTheme, string> = {
  react: "Debug a React component",
  python: "Fix a Python script",
  javascript: "Debug JavaScript code",
  space: "Explore the cosmos",
  cooking: "Match ingredients",
  music: "Identify musical elements",
  general: "Find the odd one out",
};

export function resolveExperience(context: PromptContext): ExperienceConfig {
  const theme = TOPIC_THEME_MAP[context.topic.toLowerCase()] ?? "general";

  return {
    topic: context.topic,
    category: context.category,
    theme,
    description: THEME_DESCRIPTIONS[theme],
  };
}
