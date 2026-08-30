import type { PromptCategory } from "@/types";

export function classifyIntent(prompt: string): PromptCategory {
  const trimmed = prompt.trim();
  const hasCodeBlock = trimmed.includes("```");
  const hasTechnicalPunctuation = /[{};=<>]/.test(trimmed);

  let codingScore = 0;
  let creativeScore = 0;

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

  // Strong terms carry more weight
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

  // Structural boosts
  if (hasCodeBlock) codingScore += 10;
  if (hasTechnicalPunctuation) codingScore += 5;

  // Final decision
  if (codingScore >= 3 && codingScore > creativeScore) return "coding";
  if (creativeScore >= 3 && creativeScore > codingScore) return "creative";

  return "general";
}
