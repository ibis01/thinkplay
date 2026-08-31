import { describe, it, expect } from "vitest";
import { resolveExperience } from "./experience-resolver";

describe("resolveExperience", () => {
  it("should resolve React topic", () => {
    const config = resolveExperience({ category: "coding", topic: "react" });
    expect(config.theme).toBe("react");
    expect(config.description).toBe("Debug a React component");
  });

  it("should resolve Python topic", () => {
    const config = resolveExperience({ category: "coding", topic: "python" });
    expect(config.theme).toBe("python");
    expect(config.description).toBe("Fix a Python script");
  });

  it("should resolve JavaScript topic", () => {
    const config = resolveExperience({
      category: "coding",
      topic: "javascript",
    });
    expect(config.theme).toBe("javascript");
    expect(config.description).toBe("Debug JavaScript code");
  });

  it("should resolve Space topic", () => {
    const config = resolveExperience({ category: "general", topic: "space" });
    expect(config.theme).toBe("space");
    expect(config.description).toBe("Explore the cosmos");
  });

  it("should resolve Cooking topic", () => {
    const config = resolveExperience({ category: "general", topic: "cooking" });
    expect(config.theme).toBe("cooking");
    expect(config.description).toBe("Match ingredients");
  });

  it("should resolve Music topic", () => {
    const config = resolveExperience({ category: "creative", topic: "music" });
    expect(config.theme).toBe("music");
    expect(config.description).toBe("Identify musical elements");
  });

  it("should fallback to general for unknown topics", () => {
    const config = resolveExperience({ category: "general", topic: "quantum" });
    expect(config.theme).toBe("general");
    expect(config.description).toBe("Find the odd one out");
  });

  it("should produce different configs for different topics", () => {
    const react = resolveExperience({ category: "coding", topic: "react" });
    const space = resolveExperience({ category: "general", topic: "space" });
    expect(react.theme).not.toBe(space.theme);
    expect(react.description).not.toBe(space.description);
  });
});
