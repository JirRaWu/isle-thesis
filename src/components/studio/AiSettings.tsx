import { useState } from "react";
import { AI_PROVIDER_PRESETS, isAiConfigured } from "@/config/ai-providers";
import { testAiConnection } from "@/lib/ai/client";
import type { AiConfig, AiProviderId } from "@/types/ai";

interface AiSettingsProps {
  open: boolean;
  config: AiConfig;
  onClose: () => void;
  onUpdate: (patch: Partial<AiConfig>) => void;
  onSwitchProvider: (id: AiProviderId) => void;
  onReset: () => void;
}

export function AiSettings({ open, config, onClose, onUpdate, onSwitchProvider, onReset }: AiSettingsProps) {
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  if (!open) return null;

  const preset = AI_PROVIDER_PRESETS.find((p) => p.id === config.providerId);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/35 p-4 sm:items-center" role="dialog" aria-modal>
      <div className="animate-rise w-full max-w-lg rounded-2xl bg-paper p-5 shadow-xl ring-1 ring-brand/15">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-ink">AI 设置</h2>
            <p className="mt-1 text-xs text-ink/50">
              自备 Key，浏览器直连服务商。解释问题时只发送问题字段，不上传整篇论文。
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-sm text-ink/45 hover:text-ink">
            关闭
          </button>
        </div>

        <div className="space-y-3">
          <label className="block text-xs text-ink/50">
            服务商
            <select
              className="field-input mt-1"
              value={config.providerId}
              onChange={(e) => onSwitchProvider(e.target.value as AiProviderId)}
            >
              {AI_PROVIDER_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs text-ink/50">
            Base URL
            <input
              className="field-input mt-1"
              value={config.baseUrl}
              onChange={(e) => onUpdate({ baseUrl: e.target.value })}
              placeholder="https://api.example.com/v1"
            />
          </label>

          <label className="block text-xs text-ink/50">
            API Key
            <input
              className="field-input mt-1"
              type="password"
              autoComplete="off"
              value={config.apiKey}
              onChange={(e) => onUpdate({ apiKey: e.target.value })}
              placeholder="sk-..."
            />
          </label>

          <label className="block text-xs text-ink/50">
            模型
            <input
              className="field-input mt-1"
              value={config.model}
              onChange={(e) => onUpdate({ model: e.target.value })}
              placeholder={preset?.defaultModel}
            />
          </label>

          {preset?.corsHint && <p className="text-xs text-warn">{preset.corsHint}</p>}
          {preset?.keyUrl && (
            <a href={preset.keyUrl} target="_blank" rel="noreferrer" className="text-xs text-brand hover:underline">
              获取 API Key
            </a>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={testing || !isAiConfigured(config)}
            onClick={async () => {
              setTesting(true);
              setMessage(null);
              try {
                await testAiConnection(config);
                setMessage("连接成功");
              } catch (err) {
                setMessage(err instanceof Error ? err.message : "连接失败");
              } finally {
                setTesting(false);
              }
            }}
            className="rounded-full bg-brand px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {testing ? "测试中…" : "测试连接"}
          </button>
          <button type="button" onClick={onReset} className="rounded-full px-3 py-2 text-sm text-ink/50 hover:text-danger">
            清除本地配置
          </button>
          {message && <p className="w-full text-xs text-ink/60">{message}</p>}
        </div>
      </div>
    </div>
  );
}
