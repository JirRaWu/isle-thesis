import { useCallback, useState } from "react";
import { getAiProviderPreset } from "@/config/ai-providers";
import { clearAiConfig, loadAiConfig, saveAiConfig } from "@/lib/ai/storage";
import type { AiConfig, AiProviderId } from "@/types/ai";

export function useAiConfig() {
  const [config, setConfig] = useState<AiConfig>(() => loadAiConfig());

  const update = useCallback((patch: Partial<AiConfig>) => {
    setConfig((prev) => saveAiConfig({ ...prev, ...patch }));
  }, []);

  const switchProvider = useCallback((providerId: AiProviderId) => {
    const preset = getAiProviderPreset(providerId);
    setConfig((prev) =>
      saveAiConfig({
        ...prev,
        providerId,
        baseUrl: preset.baseUrl || prev.baseUrl,
        model: preset.defaultModel || prev.model,
      }),
    );
  }, []);

  const reset = useCallback(() => {
    setConfig(clearAiConfig());
  }, []);

  return { config, update, switchProvider, reset };
}
