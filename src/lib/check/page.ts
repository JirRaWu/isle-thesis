import type { DocModel } from "../docx/model";
import { approxEqual, formatMm, twipToMm } from "../docx/units";
import type { CheckIssue, ThesisTemplate } from "../../types/thesis";
import { nextIssueId } from "./match";

export function checkPage(model: DocModel, template: ThesisTemplate): CheckIssue[] {
  const issues: CheckIssue[] = [];
  const tol = template.page.toleranceMm ?? 1;
  const width = twipToMm(model.page.widthTwip);
  const height = twipToMm(model.page.heightTwip);

  if (!approxEqual(width, template.page.width, tol) || !approxEqual(height, template.page.height, tol)) {
    issues.push({
      id: nextIssueId("page"),
      severity: "error",
      category: "page",
      title: "纸张尺寸不符合模板",
      detail: `模板要求 ${formatMm(template.page.width)} × ${formatMm(template.page.height)}（通常为 A4）。`,
      fixHint: "Word → 布局 → 纸张大小 → 选择 A4。",
      expected: `${formatMm(template.page.width)} × ${formatMm(template.page.height)}`,
      actual: `${formatMm(width)} × ${formatMm(height)}`,
    });
  }
  return issues;
}

export function checkMargins(model: DocModel, template: ThesisTemplate): CheckIssue[] {
  const issues: CheckIssue[] = [];
  const tol = template.margins.toleranceMm ?? 2;
  const sides = [
    ["上", "top", model.page.topTwip, template.margins.top],
    ["下", "bottom", model.page.bottomTwip, template.margins.bottom],
    ["左", "left", model.page.leftTwip, template.margins.left],
    ["右", "right", model.page.rightTwip, template.margins.right],
  ] as const;

  for (const [label, key, twip, expected] of sides) {
    const actual = twipToMm(twip);
    if (!approxEqual(actual, expected, tol)) {
      issues.push({
        id: nextIssueId(`margin-${key}`),
        severity: "error",
        category: "margin",
        title: `${label}页边距不符合模板`,
        detail: `模板要求${label}边距约 ${formatMm(expected)}（容差 ±${tol} mm）。`,
        fixHint: "Word → 布局 → 页边距 → 自定义边距。",
        expected: formatMm(expected),
        actual: formatMm(actual),
      });
    }
  }
  return issues;
}
