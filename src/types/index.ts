export type PromptCategory = "coding" | "creative" | "general";

export interface PromptContext {
  category: PromptCategory;
  topic: string;
}

export type LifecycleState =
  | "IDLE"
  | "REQUEST_STARTING"
  | "WAITING_ACTIVE"
  | "TRANSITIONING"
  | "RESPONSE_DISPLAYED"
  | "ERROR";
export interface AIRequestConfig {
  prompt: string;
  category: PromptCategory;
  estimatedDurationMs: number;
}

export interface AIEventCallbacks {
  onStart: () => void;
  onProgress: (progress: number) => void;
  onComplete: (response: string) => void;
  onError: (error: string) => void;
}
