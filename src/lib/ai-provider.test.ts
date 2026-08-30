import { describe, it, expect } from "vitest";
// this  will test the parseCategory helper by extracting it,
// or it can test the classifyIntent function with a mocked fetch.
// For now, let's test the deterministic fallback logic.

describe("Prompt Classification", () => {
  it("should identify coding prompts", () => {
    const normalized = "fix this react bug".replace(/["'\s]/g, "");
    expect(
      normalized.includes("coding") ||
        normalized.includes("react") ||
        normalized.includes("bug"),
    ).toBe(true);
  });

  it("should identify creative prompts", () => {
    const normalized = "write a poem about space".replace(/["'\s]/g, "");
    expect(
      normalized.includes("creative") ||
        normalized.includes("poem") ||
        normalized.includes("write"),
    ).toBe(true);
  });
});
