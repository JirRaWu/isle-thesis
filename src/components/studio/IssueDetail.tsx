import { useState } from "react";
import { isAiConfigured } from "@/config/ai-providers";
import { explainIssue } from "@/lib/ai/client";
import type { AiConfig } from "@/types/ai";
import type { CheckIssue } from "@/types/thesis";

interface IssueDetailProps {
  issue: CheckIssue | null;
  aiConfig: AiConfig;
  onOpenAiSettings: () => void;
}

export function IssueDetail({ issue, aiConfig, onOpenAiSettings }: IssueDetailProps) {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!issue) {
    return (
      <div className="rounded-2xl bg-white/60 px-4 py-8 text-center text-sm text-ink/45 ring-1 ring-brand/8">
        选择左侧问题查看详情
      </div>
    );
  }

  const askAi = async () => {
    setError(null);
    setAdvice(null);
    if (!isAiConfigured(aiConfig)) {
      onOpenAiSettings();
      return;
    }
    setLoading(true);
    try {
      const text = await explainIssue(aiConfig, issue);
      setAdvice(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI 请求失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl bg-white/70 p-4 ring-1 ring-brand/10">
      <div>
        <p className="text-xs uppercase tracking-wider text-ink/40">问题详情</p>
        <h3 className="mt-1 text-lg font-semibold text-ink">{issue.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink/70">{issue.detail}</p>
      </div>

      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        {issue.expected && (
          <div className="rounded-xl bg-ok/8 px-3 py-2">
            <dt className="text-xs text-ok">期望</dt>
            <dd className="mt-0.5 text-ink/80">{issue.expected}</dd>
          </div>
        )}
        {issue.actual && (
          <div className="rounded-xl bg-danger/8 px-3 py-2">
            <dt className="text-xs text-danger">实际</dt>
            <dd className="mt-0.5 text-ink/80">{issue.actual}</dd>
          </div>
        )}
      </dl>

      {issue.snippet && (
        <blockquote className="rounded-xl border-l-2 border-brand/40 bg-brand/5 px-3 py-2 text-sm text-ink/65">
          {issue.snippet}
          {issue.paragraphIndex != null && (
            <span className="mt-1 block text-xs text-ink/40">段落 #{issue.paragraphIndex + 1}</span>
          )}
        </blockquote>
      )}

      <div className="rounded-xl bg-ink/[0.03] px-3 py-2.5 text-sm text-ink/75">
        <p className="text-xs font-medium text-ink/45">修改建议</p>
        <p className="mt-1 leading-relaxed">{issue.fixHint}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={() => {
            setAdvice(null);
            void askAi();
          }}
          className="rounded-full bg-ink px-3.5 py-1.5 text-sm text-white transition hover:bg-ink/85 disabled:opacity-60"
        >
          {loading ? "AI 解释中…" : "用 AI 解释这一条"}
        </button>
        <button type="button" onClick={onOpenAiSettings} className="text-xs text-brand hover:underline">
          AI 设置
        </button>
      </div>

      {error && <p className="text-xs text-danger">{error}</p>}
      {advice && (
        <div className="animate-fade rounded-xl bg-brand/5 px-3 py-3 text-sm leading-relaxed whitespace-pre-wrap text-ink/75 ring-1 ring-brand/10">
          {advice}
        </div>
      )}
    </div>
  );
}
