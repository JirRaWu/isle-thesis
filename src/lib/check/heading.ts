import type { DocModel } from "../docx/model";
import { approxEqual, formatPt, halfPointToPt } from "../docx/units";
import type { CheckIssue, ThesisTemplate } from "../../types/thesis";
import { fontSpecMatches, nextIssueId, snippetOf } from "./match";

export function checkHeadings(model: DocModel, template: ThesisTemplate): CheckIssue[] {
  const issues: CheckIssue[] = [];
  const headings = model.paragraphs.filter((p) => p.outlineLvl != null && p.outlineLvl <= 2 && !p.isEmpty);

  for (const spec of template.headings) {
    const levelParas = headings.filter((p) => p.outlineLvl === spec.level - 1);
    if (!levelParas.length) continue;

    let fontMiss = 0;
    let sizeMiss = 0;
    let boldMiss = 0;
    let sample = levelParas[0]!;

    for (const p of levelParas) {
      const fonts = fontSpecMatches(p.run.eastAsiaFont, p.run.asciiFont ?? p.run.hAnsiFont, spec.fonts);
      if (!fonts.eastAsia) {
        fontMiss += 1;
        sample = p;
      }
      if (p.run.sizeHalfPoints != null) {
        const pt = halfPointToPt(p.run.sizeHalfPoints);
        if (!approxEqual(pt, spec.size.pt, spec.size.tolerancePt ?? 1)) {
          sizeMiss += 1;
          sample = p;
        }
      }
      if (spec.bold && p.run.bold === false) {
        boldMiss += 1;
        sample = p;
      }
    }

    if (fontMiss > 0) {
      issues.push({
        id: nextIssueId(`h${spec.level}-font`),
        severity: "warning",
        category: "heading",
        title: `${spec.level} 级标题字体可能不符`,
        detail: `检测到 ${levelParas.length} 个 ${spec.level} 级标题，其中 ${fontMiss} 个字体不在推荐列表（如 ${spec.fonts.eastAsia[0]}）。`,
        fixHint: `修改「标题 ${spec.level}」样式的中文字体，或选中标题后统一设置。`,
        paragraphIndex: sample.index,
        snippet: snippetOf(sample.text),
        expected: spec.fonts.eastAsia.join(" / "),
        actual: sample.run.eastAsiaFont ?? "未设置",
      });
    }

    if (sizeMiss > 0) {
      issues.push({
        id: nextIssueId(`h${spec.level}-size`),
        severity: "warning",
        category: "heading",
        title: `${spec.level} 级标题字号可能不符`,
        detail: `推荐约 ${formatPt(spec.size.pt)}，有 ${sizeMiss} 处偏离。`,
        fixHint: `在「标题 ${spec.level}」样式中设置字号。`,
        paragraphIndex: sample.index,
        snippet: snippetOf(sample.text),
        expected: formatPt(spec.size.pt),
        actual:
          sample.run.sizeHalfPoints != null ? formatPt(halfPointToPt(sample.run.sizeHalfPoints)) : "未设置",
      });
    }

    if (boldMiss > 0) {
      issues.push({
        id: nextIssueId(`h${spec.level}-bold`),
        severity: "info",
        category: "heading",
        title: `${spec.level} 级标题建议加粗`,
        detail: `有 ${boldMiss} 处 ${spec.level} 级标题未检测到加粗。`,
        fixHint: "标题样式中勾选加粗。",
        paragraphIndex: sample.index,
        snippet: snippetOf(sample.text),
      });
    }
  }

  // Hierarchy: no skip from 1 → 3
  let lastLevel = -1;
  for (const p of headings) {
    const level = p.outlineLvl!;
    if (lastLevel >= 0 && level > lastLevel + 1) {
      issues.push({
        id: nextIssueId("h-skip"),
        severity: "warning",
        category: "heading",
        title: "标题层级跳级",
        detail: `从 ${lastLevel + 1} 级直接到了 ${level + 1} 级，目录与排版会显得不规范。`,
        fixHint: "补上中间层级标题，或调整样式级别。",
        paragraphIndex: p.index,
        snippet: snippetOf(p.text),
      });
    }
    lastLevel = level;
  }

  return issues;
}
