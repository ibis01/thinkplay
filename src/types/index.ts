export type PromptCategory = "coding" | "creative" | "general";

export type LifecycleState = 
  | "IDLE"
  | "CLASSIFYING"
  | "WAITING_ACTIVE"
  | "TRANSITIONING_TO_RESPONSE"
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
