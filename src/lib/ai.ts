import { PromptCategory, AIEventCallbacks } from '@/types';

export function mockAIRequest(
  prompt: string,
  category: PromptCategory,
  callbacks: AIEventCallbacks
): void {
  callbacks.onStart();
  const duration = Math.floor(Math.random() * 4000) + 2000; // 2s to 6s
  const startTime = Date.now();

  const progressInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    callbacks.onProgress(progress);

    if (progress >= 1) {
      clearInterval(progressInterval);
      let response = "";
      if (category === "coding") {
        response = `// Fixed and optimized code for:\n// "${prompt}"\n\nfunction optimizedSolution() {\n  console.log("Bug fixed and performance improved!");\n  return true;\n}`;
      } else if (category === "creative") {
        response = `Here is your creative generation based on: "${prompt}"\n\nThe digital canvas blooms with vibrant, algorithmic flowers, each petal representing a unique data point converging into a masterpiece of generative art.`;
      } else {
        response = `Here is the comprehensive answer to your request: "${prompt}"\n\nThinkPlay successfully kept you engaged during the ${Math.round(duration / 1000)}s processing time. The AI has now completed its task.`;
      }
      callbacks.onComplete(response);
    }
  }, 100);
}
