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
