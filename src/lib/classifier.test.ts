import { describe, it, expect } from "vitest";
import { classifyIntent } from "./classifier";

describe("classifyIntent", () => {
  it("should classify clear coding prompts", () => {
    expect(classifyIntent("Fix this React bug")).toBe("coding");
    expect(classifyIntent("Write a Python function to sort a list")).toBe(
      "coding",
    );
    expect(classifyIntent("```javascript\nconsole.log('hi')\n```")).toBe(
      "coding",
    );
    expect(classifyIntent("Debug my JavaScript application")).toBe("coding");
  });

  it("should classify clear creative prompts", () => {
    expect(classifyIntent("Write a poem about Mars")).toBe("creative");
    expect(classifyIntent("Create a story about a robot")).toBe("creative");
    expect(classifyIntent("Design a logo for a coffee shop")).toBe("creative");
  });

  it("should classify general prompts", () => {
    expect(classifyIntent("Explain quantum physics")).toBe("general");
    expect(classifyIntent("What is the capital of France?")).toBe("general");
  });

   it("should handle ambiguous prompts correctly (technical intent wins)", () => {
     // "Write" and "art" trigger creative, but "Python function" heavily weights coding
     expect(classifyIntent("Write a Python function about art")).toBe("coding");
     // "creative writing" triggers creative, but "Debug" and "Python script" heavily weight coding
     expect(classifyIntent("Debug this creative writing Python script")).toBe(
       "coding",
     );
   });
});
