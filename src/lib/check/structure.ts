import type { DocModel } from "../docx/model";
import type { CheckIssue, ThesisTemplate } from "../../types/thesis";
import { nextIssueId, snippetOf } from "./match";

export function checkStructure(model: DocModel, template: ThesisTemplate): CheckIssue[] {
  const issues: CheckIssue[] = [];
  const texts = model.paragraphs.map((p) => p.text.trim()).filter(Boolean);

  for (const marker of template.structure) {
    const hit = model.paragraphs.find((p) => marker.patterns.some((re) => re.test(p.text.trim())));
    if (!hit) {
      // Also allow inline "关键词：..." in same line search across all
      const loose = texts.some((t) => marker.patterns.some((re) => re.test(t)));
      if (loose) continue;
      issues.push({
        id: nextIssueId(`struct-${marker.id}`),
        severity: marker.severity,
        category: "structure",
        title: `未找到「${marker.label}」`,
        detail: `模板期望文档中出现「${marker.label}」相关标题或标记。`,
        fixHint: `确认是否已按学院要求撰写「${marker.label}」；若使用了变体标题，可忽略本条。`,
      });
    }
  }

  return issues;
}

export function checkCaptions(model: DocModel, template: ThesisTemplate): CheckIssue[] {
  const issues: CheckIssue[] = [];
  if (!template.captions.length) return issues;

  const captionParas = model.paragraphs.filter((p) =>
    template.captions.some((cap) => cap.patterns.some((re) => re.test(p.text.trim()))),
  );

  // Soft check: if document mentions 如图/见表 but no formal captions
  const mentionsFigure = model.paragraphs.some((p) => /如图\s*\d+|见图\s*\d+|Fig\.?\s*\d+/i.test(p.text));
  const mentionsTable = model.paragraphs.some((p) => /如表\s*\d+|见表\s*\d+|Table\s*\d+/i.test(p.text));
  const hasFigureCap = captionParas.some((p) => template.captions[0] && template.captions[0].patterns.some((re) => re.test(p.text.trim())));
  const hasTableCap = captionParas.some((p) =>
    template.captions.some((c) => c.id === "table" && c.patterns.some((re) => re.test(p.text.trim()))),
  );

  if (mentionsFigure && !hasFigureCap) {
    issues.push({
      id: nextIssueId("cap-figure"),
      severity: "info",
      category: "caption",
      title: "正文引用了图，但未检测到规范图题",
      detail: "常见写法为「图 3-1　系统架构图」，图题一般居中、位于图下方。",
      fixHint: "为每张图添加「图 X-X　名称」题注。",
    });
  }

  if (mentionsTable && !hasTableCap) {
    issues.push({
      id: nextIssueId("cap-table"),
      severity: "info",
      category: "caption",
      title: "正文引用了表，但未检测到规范表题",
      detail: "常见写法为「表 2-1　对比结果」，表题一般居中、位于表上方。",
      fixHint: "为每张表添加「表 X-X　名称」题注。",
    });
  }

  // Validate detected captions look complete
  for (const p of captionParas.slice(0, 30)) {
    if (p.text.trim().length < 4) {
      issues.push({
        id: nextIssueId("cap-short"),
        severity: "info",
        category: "caption",
        title: "题注内容过短",
        detail: "题注宜包含编号与名称。",
        fixHint: "补全图/表名称。",
        paragraphIndex: p.index,
        snippet: snippetOf(p.text),
      });
    }
  }

  return issues;
}

export function checkEmptyRuns(model: DocModel, template: ThesisTemplate): CheckIssue[] {
  const max = template.maxConsecutiveEmpty ?? 4;
  const issues: CheckIssue[] = [];
  let run = 0;
  let runStart = 0;

  for (const p of model.paragraphs) {
    if (p.isEmpty) {
      if (run === 0) runStart = p.index;
      run += 1;
      if (run === max + 1) {
        issues.push({
          id: nextIssueId("empty-run"),
          severity: "info",
          category: "spacing",
          title: "连续空段过多",
          detail: `检测到超过 ${max} 个连续空段落，可能用回车撑版面。`,
          fixHint: "用「段前/段后」间距或分页符控制版面，避免连续敲回车。",
          paragraphIndex: runStart,
        });
      }
    } else {
      run = 0;
    }
  }

  return issues;
}
