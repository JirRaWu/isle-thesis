import type { DocModel } from "../docx/model";
import type { CheckIssue } from "../../types/thesis";
import { nextIssueId, snippetOf } from "./match";

const TOC_HEADING = /^(目\s*录|Contents)$/i;

function normalizeHeading(text: string) {
  return text
    .replace(/\u00a0/g, " ")
    .replace(/[.·．…\s]+\d+\s*$/, "") // trailing leaders + page number
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function findTocBlock(model: DocModel) {
  const start = model.paragraphs.findIndex((p) => TOC_HEADING.test(p.text.trim()));
  if (start < 0) return null;
  const stop = /^(摘\s*要|Abstract|第\s*[一二三四五六七八九十\d]+|1\s|参考文献|致\s*谢)/i;
  let end = model.paragraphs.length;
  for (let i = start + 1; i < model.paragraphs.length; i += 1) {
    const t = model.paragraphs[i]!.text.trim();
    if (!t) continue;
    // stop when we hit a real body heading that is also an outline heading after several toc lines
    if (i > start + 1 && model.paragraphs[i]!.outlineLvl === 0 && !/[.…]{2,}\s*\d+\s*$/.test(t) && stop.test(t)) {
      end = i;
      break;
    }
    if (i > start + 8 && model.paragraphs[i]!.outlineLvl === 0 && t.length < 40 && !/[.…]{2,}/.test(t)) {
      // likely first chapter heading after TOC
      end = i;
      break;
    }
  }
  return { start, end, lines: model.paragraphs.slice(start + 1, end).filter((p) => p.text.trim()) };
}

/** Compare directory entries with actual outline headings. */
export function checkToc(model: DocModel): CheckIssue[] {
  const issues: CheckIssue[] = [];
  const toc = findTocBlock(model);
  if (!toc) return issues;

  const outlineHeadings = model.paragraphs.filter(
    (p) => p.outlineLvl != null && p.outlineLvl <= 2 && !p.isEmpty && !TOC_HEADING.test(p.text.trim()),
  );
  if (!outlineHeadings.length || toc.lines.length < 2) return issues;

  const tocNorm = new Set(toc.lines.map((p) => normalizeHeading(p.text)).filter((t) => t.length >= 2));
  const missing: typeof outlineHeadings = [];
  for (const h of outlineHeadings) {
    const key = normalizeHeading(h.text);
    if (key.length < 2) continue;
    // skip abstract/ref style headings often before TOC
    if (/^(摘要|abstract|关键词|参考文献|致谢)$/i.test(key)) continue;
    let hit = false;
    for (const entry of tocNorm) {
      if (entry.includes(key) || key.includes(entry)) {
        hit = true;
        break;
      }
    }
    if (!hit) missing.push(h);
  }

  if (missing.length >= Math.max(1, Math.ceil(outlineHeadings.length * 0.34))) {
    issues.push({
      id: nextIssueId("toc-miss"),
      severity: "warning",
      category: "toc",
      title: "目录与正文标题可能不一致",
      detail: `有 ${missing.length} 个正文标题未能在目录中匹配到近似条目（例如「${missing[0]!.text.slice(0, 24)}」）。`,
      fixHint: "更新域：点击目录 → 引用 → 更新目录；或确认标题使用了「标题 1/2/3」样式。",
      paragraphIndex: missing[0]!.index,
      snippet: snippetOf(missing[0]!.text),
    });
  }

  return issues;
}
