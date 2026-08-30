import type { PromptCategory, PromptContext } from "@/types";

// Topic mapping for local extraction
const TOPIC_KEYWORDS: Record<string, string[]> = {
  react: ["react", "jsx", "hooks", "component", "nextjs", "next.js"],
  python: ["python", "django", "flask", "pip", "pandas"],
  javascript: ["javascript", "js", "node", "npm", "typescript", "ts"],
  space: ["space", "mars", "planet", "rocket", "nasa", "astronomy", "star"],
  cooking: ["cooking", "recipe", "food", "bake", "chef", "kitchen"],
  music: ["music", "song", "guitar", "piano", "lyrics", "band"],
};

export function classifyIntent(prompt: string): PromptContext {
  const trimmed = prompt.trim();
  const lower = trimmed.toLowerCase();

  const hasCodeBlock = trimmed.includes("```");
  const hasTechnicalPunctuation = /[{};=<>]/.test(trimmed);

  let codingScore = 0;
  let creativeScore = 0;
  let detectedTopic = "general";

  const strongCodingTerms = [
    "python",
    "javascript",
    "typescript",
    "react",
    "node",
    "sql",
    "database",
    "api",
    "debug",
    "bug",
    "compile",
    "algorithm",
    "frontend",
    "backend",
    "server",
    "css",
    "html",
    "code",
  ];

  const strongCreativeTerms = [
    "poem",
    "story",
    "logo",
    "design",
    "draw",
    "paint",
    "creative",
    "imagine",
    "compose",
    "lyrics",
    "narrative",
    "worldbuilding",
    "character",
  ];

  // 1. Calculate Scores
  strongCodingTerms.forEach((term) => {
    if (new RegExp(`\\b${term}\\b`, "i").test(prompt)) codingScore += 3;
  });

  strongCreativeTerms.forEach((term) => {
    if (new RegExp(`\\b${term}\\b`, "i").test(prompt)) creativeScore += 3;
  });

  const secondaryCodingTerms = [
    "function",
    "error",
    "fix",
    "script",
    "program",
  ];
  const secondaryCreativeTerms = ["write", "create", "image", "art", "draft"];

  secondaryCodingTerms.forEach((term) => {
    if (new RegExp(`\\b${term}\\b`, "i").test(prompt)) codingScore += 1;
  });

  secondaryCreativeTerms.forEach((term) => {
    if (new RegExp(`\\b${term}\\b`, "i").test(prompt)) creativeScore += 1;
  });

  if (hasCodeBlock) codingScore += 10;
  if (hasTechnicalPunctuation) codingScore += 5;

  // 2. Extract Topic (Local Context Engine)
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      detectedTopic = topic;
      break; // Take the first strong match
    }
  }

  // 3. Determine Category
  let category: PromptCategory = "general";
  if (codingScore >= 3 && codingScore > creativeScore) category = "coding";
  else if (creativeScore >= 3 && creativeScore > codingScore)
    category = "creative";

  return { category, topic: detectedTopic };
}
