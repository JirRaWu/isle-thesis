import type { DocModel, DocParagraph } from "../docx/model";
import {
  approxEqual,
  formatMultiple,
  formatPt,
  halfPointToPt,
  lineMultipleFromWord,
  twipToMm,
} from "../docx/units";
import type { CheckIssue, ThesisTemplate } from "../../types/thesis";
import { fontSpecMatches, nextIssueId, snippetOf } from "./match";

function isBodyParagraph(p: DocParagraph) {
  if (p.isEmpty) return false;
  if (p.outlineLvl != null && p.outlineLvl <= 2) return false;
  const t = p.text.trim();
  if (/^(摘\s*要|Abstract|关键词|Key\s*words?|目\s*录|Contents|参考文献|References|致\s*谢)/i.test(t)) {
    return false;
  }
  if (/^(图|表)\s*\d+/.test(t)) return false;
  // Skip very short title-like lines
  if (t.length < 8) return false;
  return true;
}

export function checkBodyTypography(model: DocModel, template: ThesisTemplate): CheckIssue[] {
  const issues: CheckIssue[] = [];
  const bodyParas = model.paragraphs.filter(isBodyParagraph);
  if (!bodyParas.length) return issues;

  const sample = bodyParas.slice(0, 80);
  let fontMiss = 0;
  let sizeMiss = 0;
  let lineMiss = 0;
  let indentMiss = 0;
  let firstFont: DocParagraph | undefined;
  let firstSize: DocParagraph | undefined;
  let firstLine: DocParagraph | undefined;
  let firstIndent: DocParagraph | undefined;

  const sizeTol = template.body.size.tolerancePt ?? 0.5;
  const lineTol = template.body.lineSpacing.tolerance ?? 0.08;
  const expectedIndentTwip =
    template.body.firstLineIndentChars != null
      ? Math.round(((template.body.size.pt * template.body.firstLineIndentChars) / 72) * 1440)
      : undefined;
  const indentTolTwip = 120; // ~2mm

  for (const p of sample) {
    const fonts = fontSpecMatches(p.run.eastAsiaFont, p.run.asciiFont ?? p.run.hAnsiFont, template.body.fonts);
    if (!fonts.eastAsia || !fonts.ascii) {
      fontMiss += 1;
      firstFont ??= p;
    }
    if (p.run.sizeHalfPoints != null) {
      const pt = halfPointToPt(p.run.sizeHalfPoints);
      if (!approxEqual(pt, template.body.size.pt, sizeTol)) {
        sizeMiss += 1;
        firstSize ??= p;
      }
    }
    if (p.line != null) {
      const multiple = lineMultipleFromWord(p.line, p.lineRule);
      if (!approxEqual(multiple, template.body.lineSpacing.multiple, lineTol)) {
        lineMiss += 1;
        firstLine ??= p;
      }
    }
    if (expectedIndentTwip != null && p.indentFirstLineTwip != null) {
      if (Math.abs(p.indentFirstLineTwip - expectedIndentTwip) > indentTolTwip) {
        indentMiss += 1;
        firstIndent ??= p;
      }
    } else if (expectedIndentTwip != null && p.indentFirstLineTwip == null && p.text.trim().length > 20) {
      // Many docs inherit indent from style — if missing entirely on long body text, warn lightly
      indentMiss += 1;
      firstIndent ??= p;
    }
  }

  const threshold = Math.max(3, Math.floor(sample.length * 0.25));

  if (fontMiss >= threshold && firstFont) {
    issues.push({
      id: nextIssueId("font-body"),
      severity: "error",
      category: "font",
      title: "正文字体不符合模板",
      detail: `抽样 ${sample.length} 段中有 ${fontMiss} 段字体不匹配。中文宜用 ${template.body.fonts.eastAsia[0]}，西文宜用 ${template.body.fonts.ascii[0]}。`,
      fixHint: "选中正文 → 开始 → 字体，分别设置中文字体与西文字体；或修改「正文」样式。",
      paragraphIndex: firstFont.index,
      snippet: snippetOf(firstFont.text),
      expected: `${template.body.fonts.eastAsia[0]} / ${template.body.fonts.ascii[0]}`,
      actual: `${firstFont.run.eastAsiaFont ?? "未设置"} / ${firstFont.run.asciiFont ?? firstFont.run.hAnsiFont ?? "未设置"}`,
    });
  }

  if (sizeMiss >= threshold && firstSize) {
    issues.push({
      id: nextIssueId("size-body"),
      severity: "error",
      category: "size",
      title: "正文字号不符合模板",
      detail: `模板要求正文约 ${formatPt(template.body.size.pt)}（小四）。抽样发现 ${sizeMiss} 段不符。`,
      fixHint: "将正文样式字号设为小四（12 磅），避免直接拉大字号。",
      paragraphIndex: firstSize.index,
      snippet: snippetOf(firstSize.text),
      expected: formatPt(template.body.size.pt),
      actual: firstSize.run.sizeHalfPoints != null ? formatPt(halfPointToPt(firstSize.run.sizeHalfPoints)) : "未设置",
    });
  }

  if (lineMiss >= threshold && firstLine) {
    issues.push({
      id: nextIssueId("line-body"),
      severity: "error",
      category: "spacing",
      title: "正文行距不符合模板",
      detail: `模板要求约 ${formatMultiple(template.body.lineSpacing.multiple)}行距。抽样发现 ${lineMiss} 段不符。`,
      fixHint: "段落 → 行距选项 → 多倍行距，设为 1.5 倍（不要用固定值除非学院明确要求）。",
      paragraphIndex: firstLine.index,
      snippet: snippetOf(firstLine.text),
      expected: formatMultiple(template.body.lineSpacing.multiple),
      actual:
        firstLine.line != null
          ? formatMultiple(lineMultipleFromWord(firstLine.line, firstLine.lineRule))
          : "未设置",
    });
  }

  if (expectedIndentTwip != null && indentMiss >= threshold && firstIndent) {
    issues.push({
      id: nextIssueId("indent-body"),
      severity: "warning",
      category: "indent",
      title: "正文首行缩进可能不符",
      detail: `模板建议首行缩进约 ${template.body.firstLineIndentChars} 个字符（约 ${twipToMm(expectedIndentTwip).toFixed(1)} mm）。抽样发现 ${indentMiss} 段可能不符。`,
      fixHint: "段落 → 缩进 → 特殊 → 首行，磅值按 2 字符设置；或在样式中统一配置。",
      paragraphIndex: firstIndent.index,
      snippet: snippetOf(firstIndent.text),
      expected: `${template.body.firstLineIndentChars} 字符`,
      actual:
        firstIndent.indentFirstLineTwip != null
          ? `${twipToMm(firstIndent.indentFirstLineTwip).toFixed(1)} mm`
          : "未检测到",
    });
  }

  return issues;
}
