import type { PromptCategory } from "@/types";

export function classifyIntent(prompt: string): PromptCategory {
  const lower = prompt.toLowerCase();
  const trimmed = prompt.trim();

  const isShort = trimmed.length < 50;
  const hasCodeBlock = trimmed.includes("```");
  const hasTechnicalPunctuation = /[{};=<>]/.test(trimmed);

  let codingScore = 0;
  let creativeScore = 0;

  const codingTerms = [
    "code",
    "javascript",
    "python",
    "bug",
    "debug",
    "api",
    "react",
    "function",
    "css",
    "html",
    "error",
    "fix",
    "compile",
    "algorithm",
    "database",
    "sql",
    "typescript",
    "node",
    "server",
    "frontend",
    "backend",
  ];

  const creativeTerms = [
    "write",
    "story",
    "poem",
    "image",
    "design",
    "logo",
    "art",
    "draw",
    "paint",
    "creative",
    "imagine",
    "draft",
    "compose",
    "lyrics",
    "narrative",
    "character",
    "worldbuilding",
  ];

  codingTerms.forEach((term) => {
    if (lower.includes(term)) codingScore += 2;
  });

  creativeTerms.forEach((term) => {
    if (lower.includes(term)) creativeScore += 2;
  });

  if (hasCodeBlock || hasTechnicalPunctuation) codingScore += 5;
  if (isShort && (lower.includes("write") || lower.includes("give me")))
    creativeScore += 3;

  if (codingScore >= 3 && codingScore > creativeScore) return "coding";
  if (creativeScore >= 3 && creativeScore > codingScore) return "creative";

  return "general";
}
