import { AiClientError } from "@/lib/ai/errors";

export function joinAiUrl(baseUrl: string, path: string) {
  const root = baseUrl.replace(/\/+$/, "");
  if (root.endsWith("/v1") && path.startsWith("/v1/")) {
    return `${root}${path.slice(3)}`;
  }
  return `${root}${path.startsWith("/") ? path : `/${path}`}`;
}

export function readAiErrorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object" && "error" in payload) {
    const error = (payload as { error: unknown }).error;
    if (typeof error === "string" && error.trim()) return error.trim();
    if (error && typeof error === "object" && "message" in error) {
      const message = (error as { message?: unknown }).message;
      if (typeof message === "string" && message.trim()) return message.trim();
    }
  }
  return fallback;
}

export async function parseJsonResponse(response: Response) {
  const rawText = await response.text();
  if (!rawText) return { payload: null as unknown, rawText: "" };
  try {
    return { payload: JSON.parse(rawText) as unknown, rawText };
  } catch {
    return { payload: null as unknown, rawText };
  }
}

export async function aiFetch(config: { apiKey: string; baseUrl: string }, path: string, init: RequestInit) {
  const apiKey = config.apiKey.trim();
  const baseUrl = config.baseUrl.trim();
  if (!apiKey || !baseUrl) throw new AiClientError("请先填写 API Key 和 Base URL");

  let response: Response;
  try {
    response = await fetch(joinAiUrl(baseUrl, path), {
      ...init,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        ...(init.headers ?? {}),
      },
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new AiClientError("无法连接服务商，请检查网络、Base URL，或对方是否允许浏览器跨域访问");
  }

  const { payload, rawText } = await parseJsonResponse(response);
  if (!response.ok) {
    throw new AiClientError(
      `服务商返回 ${response.status}：${readAiErrorMessage(payload, rawText.slice(0, 200) || response.statusText)}`,
    );
  }
  return { response, payload, rawText };
}
