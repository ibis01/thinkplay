import { describe, it, expect } from "vitest";
import { classifyIntent } from "./classifier";

describe("classifyIntent", () => {
  it("should classify clear coding prompts and extract topic", () => {
    const result = classifyIntent("Fix this React bug");
    expect(result.category).toBe("coding");
    expect(result.topic).toBe("react");
  });

  it("should classify clear creative prompts and extract topic", () => {
    const result = classifyIntent("Write a poem about Mars");
    expect(result.category).toBe("creative");
    expect(result.topic).toBe("space");
  });

  it("should classify general prompts and fallback to general topic", () => {
    const result = classifyIntent("Explain quantum physics");
    expect(result.category).toBe("general");
    expect(result.topic).toBe("general");
  });

  it("should handle ambiguous prompts correctly (technical intent wins)", () => {
    const result1 = classifyIntent("Write a Python function about art");
    expect(result1.category).toBe("coding");
    expect(result1.topic).toBe("python");

    const result2 = classifyIntent("Debug this creative writing Python script");
    expect(result2.category).toBe("coding");
    expect(result2.topic).toBe("python");
  });
});
