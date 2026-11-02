import { AiClientError } from "@/lib/ai/errors";
import { aiFetch } from "@/lib/ai/http";
import type { AiChatMessage, AiConfig } from "@/types/ai";
import type { CheckIssue } from "@/types/thesis";

export { AiClientError };

function extractContent(payload: unknown): string {
  if (!payload || typeof payload !== "object") throw new AiClientError("服务商返回了无法解析的内容");
  const choices = (payload as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || !choices.length) throw new AiClientError("服务商未返回可用结果");
  const message = (choices[0] as { message?: { content?: unknown } }).message;
  const content = message?.content;
  if (typeof content === "string" && content.trim()) return content.trim();
  throw new AiClientError("服务商返回了空回复");
}

export async function chatCompletion(
  config: AiConfig,
  messages: AiChatMessage[],
  options?: { temperature?: number; signal?: AbortSignal },
) {
  const model = config.model.trim();
  if (!model) throw new AiClientError("请先填写模型名");
  const { payload } = await aiFetch(config, "/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: options?.signal,
    body: JSON.stringify({
      model,
      messages,
      temperature: options?.temperature ?? 0.3,
      stream: false,
    }),
  });
  return extractContent(payload);
}

export async function testAiConnection(config: AiConfig, signal?: AbortSignal) {
  const reply = await chatCompletion(
    config,
    [
      { role: "system", content: "Reply with exactly: ok" },
      { role: "user", content: "ping" },
    ],
    { temperature: 0, signal },
  );
  if (!/ok/i.test(reply)) throw new AiClientError(`连接成功，但模型回复异常：${reply.slice(0, 80)}`);
}

/** Ask the model to explain one format issue in plain Chinese. Document text stays local — only the issue fields are sent. */
export async function explainIssue(config: AiConfig, issue: CheckIssue, signal?: AbortSignal) {
  return chatCompletion(
    config,
    [
      {
        role: "system",
        content:
          "你是毕业论文排版助手。用简洁中文解释格式问题，并给出在 Microsoft Word 中的具体操作步骤。不要编造学院未提供的规则。",
      },
      {
        role: "user",
        content: [
          `问题：${issue.title}`,
          `说明：${issue.detail}`,
          issue.expected ? `期望：${issue.expected}` : "",
          issue.actual ? `实际：${issue.actual}` : "",
          issue.snippet ? `附近原文：${issue.snippet}` : "",
          issue.fixHint ? `系统提示：${issue.fixHint}` : "",
          "请用：1）问题含义 2）为什么重要 3）Word 操作步骤 三段回答，控制在 200 字内。",
        ]
          .filter(Boolean)
          .join("\n"),
      },
    ],
    { signal },
  );
}
