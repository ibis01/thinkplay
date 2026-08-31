import { describe, it, expect } from "vitest";
import { resolveExperience } from "./experience-resolver";
import type { PromptContext } from "@/types";

describe("resolveExperience", () => {
  it("should resolve React topic to React experience", () => {
    const context: PromptContext = { category: "coding", topic: "react" };
    const config = resolveExperience(context);
    expect(config.theme).toBe("react");
    expect(config.description).toBe("Debug a React component");
  });

  it("should resolve Python topic to Python experience", () => {
    const context: PromptContext = { category: "coding", topic: "python" };
    const config = resolveExperience(context);
    expect(config.theme).toBe("python");
    expect(config.description).toBe("Fix a Python script");
  });

  it("should resolve Space topic to Space experience", () => {
    const context: PromptContext = { category: "general", topic: "space" };
    const config = resolveExperience(context);
    expect(config.theme).toBe("space");
    expect(config.description).toBe("Explore the cosmos");
  });

  it("should resolve Cooking topic to Cooking experience", () => {
    const context: PromptContext = { category: "general", topic: "cooking" };
    const config = resolveExperience(context);
    expect(config.theme).toBe("cooking");
    expect(config.description).toBe("Match ingredients");
  });

  it("should resolve unknown topic to generic experience", () => {
    const context: PromptContext = { category: "general", topic: "unknown" };
    const config = resolveExperience(context);
    expect(config.theme).toBe("general");
    expect(config.description).toBe("Find the odd one out");
  });

  it("should produce meaningfully different configs for different topics", () => {
    const reactConfig = resolveExperience({
      category: "coding",
      topic: "react",
    });
    const spaceConfig = resolveExperience({
      category: "general",
      topic: "space",
    });

    expect(reactConfig.theme).not.toBe(spaceConfig.theme);
    expect(reactConfig.description).not.toBe(spaceConfig.description);
  });

  it("should handle case-insensitive topic matching", () => {
    const config = resolveExperience({ category: "coding", topic: "React" });
    expect(config.theme).toBe("react");
  });
});
