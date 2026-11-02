import { AI_STORAGE_KEY } from "@/config/constants";
import type { AiConfig, AiProviderId, AiProviderPreset } from "@/types/ai";

export { AI_STORAGE_KEY };

export const AI_PROVIDER_PRESETS: AiProviderPreset[] = [
  {
    id: "deepseek",
    name: "DeepSeek",
    baseUrl: "https://api.deepseek.com/v1",
    defaultModel: "deepseek-chat",
    keyUrl: "https://platform.deepseek.com/api_keys",
  },
  {
    id: "qwen",
    name: "通义千问",
    baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    defaultModel: "qwen-plus",
    keyUrl: "https://bailian.console.aliyun.com",
    corsHint: "若官方接口禁 CORS，请改用兼容网关。",
  },
  {
    id: "openai",
    name: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4o-mini",
    keyUrl: "https://platform.openai.com/api-keys",
    corsHint: "官方接口可能不允许浏览器直连，失败时请用兼容网关。",
  },
  {
    id: "custom",
    name: "自定义兼容端点",
    baseUrl: "",
    defaultModel: "",
    keyUrl: "",
    corsHint: "填写 OpenAI 兼容 Base URL（通常以 /v1 结尾）。",
  },
];

export const DEFAULT_AI_CONFIG: AiConfig = {
  providerId: "deepseek",
  apiKey: "",
  baseUrl: AI_PROVIDER_PRESETS[0]!.baseUrl,
  model: AI_PROVIDER_PRESETS[0]!.defaultModel,
};

export function getAiProviderPreset(id: AiProviderId) {
  return AI_PROVIDER_PRESETS.find((item) => item.id === id) ?? AI_PROVIDER_PRESETS[0]!;
}

export function isAiConfigured(config: AiConfig) {
  return Boolean(config.apiKey.trim() && config.baseUrl.trim() && config.model.trim());
}
