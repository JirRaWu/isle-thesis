import type { CheckReport } from "@/types/thesis";

function severityLabel(sev: string) {
  if (sev === "error") return "错误";
  if (sev === "warning") return "警告";
  return "提示";
}

export function reportToMarkdown(report: CheckReport) {
  const lines = [
    `# 简屿 · 论文格式检查报告`,
    ``,
    `- 文件：${report.fileName}`,
    `- 模板：${report.templateName}`,
    `- 时间：${new Date(report.checkedAt).toLocaleString()}`,
    `- 段落数：${report.paragraphCount}`,
    `- 得分：${report.summary.score}（错误 ${report.summary.errors} / 警告 ${report.summary.warnings} / 提示 ${report.summary.infos}）`,
    ``,
    `> 本报告由浏览器本地生成，文档未上传服务器。模板规则为参考实现，请以学院正式规范为准。`,
    ``,
  ];

  if (!report.issues.length) {
    lines.push(`未发现明显格式问题。仍建议人工对照学院最新《撰写规范》复查。`);
    return lines.join("\n");
  }

  lines.push(`## 问题列表`, ``);
  report.issues.forEach((issue, i) => {
    lines.push(`### ${i + 1}. [${severityLabel(issue.severity)}] ${issue.title}`);
    lines.push(``);
    lines.push(issue.detail);
    if (issue.expected) lines.push(`- 期望：${issue.expected}`);
    if (issue.actual) lines.push(`- 实际：${issue.actual}`);
    if (issue.snippet) lines.push(`- 附近原文：${issue.snippet}`);
    if (issue.paragraphIndex != null) lines.push(`- 段落序号：${issue.paragraphIndex + 1}`);
    lines.push(`- 修改建议：${issue.fixHint}`);
    lines.push(``);
  });

  return lines.join("\n");
}

export function downloadText(filename: string, content: string, mime = "text/markdown;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadReport(report: CheckReport) {
  const base = report.fileName.replace(/\.docx$/i, "") || "thesis";
  downloadText(`${base}-格式检查报告.md`, reportToMarkdown(report));
}
