import { AI_STORAGE_KEY, DEFAULT_AI_CONFIG, getAiProviderPreset } from "@/config/ai-providers";
import type { AiConfig, AiProviderId } from "@/types/ai";

const PROVIDER_IDS = new Set<AiProviderId>(["deepseek", "qwen", "openai", "custom"]);

function isProviderId(value: unknown): value is AiProviderId {
  return typeof value === "string" && PROVIDER_IDS.has(value as AiProviderId);
}

export function loadAiConfig(): AiConfig {
  try {
    const raw = localStorage.getItem(AI_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_AI_CONFIG };
    const parsed = JSON.parse(raw) as Partial<AiConfig>;
    const providerId = isProviderId(parsed.providerId) ? parsed.providerId : DEFAULT_AI_CONFIG.providerId;
    const preset = getAiProviderPreset(providerId);
    return {
      providerId,
      apiKey: typeof parsed.apiKey === "string" ? parsed.apiKey : "",
      baseUrl:
        typeof parsed.baseUrl === "string" && parsed.baseUrl.trim()
          ? parsed.baseUrl.trim().replace(/\/+$/, "")
          : preset.baseUrl,
      model: typeof parsed.model === "string" && parsed.model.trim() ? parsed.model.trim() : preset.defaultModel,
    };
  } catch {
    return { ...DEFAULT_AI_CONFIG };
  }
}

export function saveAiConfig(config: AiConfig) {
  const next: AiConfig = {
    providerId: config.providerId,
    apiKey: config.apiKey.trim(),
    baseUrl: config.baseUrl.trim().replace(/\/+$/, ""),
    model: config.model.trim(),
  };
  localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function clearAiConfig() {
  localStorage.removeItem(AI_STORAGE_KEY);
  return { ...DEFAULT_AI_CONFIG };
}
