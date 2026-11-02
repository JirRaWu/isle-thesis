export type AiProviderId = "deepseek" | "qwen" | "openai" | "custom";

export interface AiConfig {
  providerId: AiProviderId;
  apiKey: string;
  baseUrl: string;
  model: string;
}

export interface AiProviderPreset {
  id: AiProviderId;
  name: string;
  baseUrl: string;
  defaultModel: string;
  keyUrl: string;
  corsHint?: string;
}

export interface AiChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}
