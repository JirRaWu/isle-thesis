import type { DocModel } from "../docx/model";
import type { CheckReport, CheckSummary, ThesisTemplate } from "../../types/thesis";
import { checkBodyTypography } from "./body";
import { checkHeadings } from "./heading";
import { resetIssueIds } from "./match";
import { checkMargins, checkPage } from "./page";
import { checkPagination } from "./pagination";
import { checkReferences } from "./references";
import { checkCaptions, checkEmptyRuns, checkStructure } from "./structure";
import { checkToc } from "./toc";

function summarize(issues: CheckReport["issues"]): CheckSummary {
  const errors = issues.filter((i) => i.severity === "error").length;
  const warnings = issues.filter((i) => i.severity === "warning").length;
  const infos = issues.filter((i) => i.severity === "info").length;
  // Start at 100; errors hurt more than warnings.
  const score = Math.max(0, Math.min(100, Math.round(100 - errors * 12 - warnings * 5 - infos * 1)));
  return { errors, warnings, infos, score };
}

export function runChecks(model: DocModel, template: ThesisTemplate): CheckReport {
  resetIssueIds();
  const issues = [
    ...checkPage(model, template),
    ...checkMargins(model, template),
    ...checkBodyTypography(model, template),
    ...checkHeadings(model, template),
    ...checkStructure(model, template),
    ...checkReferences(model),
    ...checkPagination(model),
    ...checkToc(model),
    ...checkCaptions(model, template),
    ...checkEmptyRuns(model, template),
  ];

  // Stable sort: error → warning → info, then by paragraph index
  const rank = { error: 0, warning: 1, info: 2 } as const;
  issues.sort((a, b) => {
    const bySev = rank[a.severity] - rank[b.severity];
    if (bySev !== 0) return bySev;
    return (a.paragraphIndex ?? 1e9) - (b.paragraphIndex ?? 1e9);
  });

  return {
    templateId: template.id,
    templateName: template.name,
    fileName: model.fileName,
    checkedAt: new Date().toISOString(),
    paragraphCount: model.paragraphs.length,
    issues,
    summary: summarize(issues),
  };
}
