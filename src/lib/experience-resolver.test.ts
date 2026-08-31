import { describe, it, expect } from 'vitest';
import { resolveExperience, TOPIC_EXPERIENCE_MAP } from './experience-resolver';
import { classifyIntent } from './classifier';

describe('Topic to Experience Integration', () => {
  it('should prove React prompts produce React-specific experience configurations', () => {
    // 1. Prompt -> Classifier
    const context = classifyIntent("Fix this React bug");
    expect(context.topic).toBe("react");
    
    // 2. Topic -> Experience Resolver
    const config = resolveExperience(context.topic, context.category);
    expect(config.description).toBe("Debug a React component");
    expect(config.theme).toBe("coding");
  });

  it('should prove Space prompts produce Space-specific experience configurations', () => {
    // 1. Prompt -> Classifier
    const context = classifyIntent("Tell me about NASA");
    expect(context.topic).toBe("space");
    
    // 2. Topic -> Experience Resolver
    const config = resolveExperience(context.topic, context.category);
    expect(config.description).toBe("Identify space objects");
    expect(config.theme).toBe("general");
  });

  it('should prove different topics produce different experience configurations', () => {
    const reactConfig = resolveExperience("react", "coding");
    const spaceConfig = resolveExperience("space", "general");

    expect(reactConfig.description).not.toBe(spaceConfig.description);
    expect(reactConfig.theme).not.toBe(spaceConfig.theme);
    expect(TOPIC_EXPERIENCE_MAP["react"]).not.toEqual(TOPIC_EXPERIENCE_MAP["space"]);
  });

  it('should fallback to category default for unknown topics', () => {
    const config = resolveExperience("unknown_topic", "coding");
    expect(config.description).toBe("Find the bug");
    expect(config.theme).toBe("coding");
  });
});