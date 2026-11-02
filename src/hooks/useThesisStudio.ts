import { useCallback, useMemo, useState } from "react";
import { TEMPLATE_STORAGE_KEY } from "@/config/constants";
import { runChecks } from "@/lib/check";
import { parseDocx, type DocModel } from "@/lib/docx";
import { getTemplate, THESIS_TEMPLATES } from "@/lib/templates";
import type { CheckIssue, CheckReport, IssueCategory, IssueSeverity } from "@/types/thesis";

function loadTemplateId() {
  try {
    return localStorage.getItem(TEMPLATE_STORAGE_KEY) ?? "generic-gb";
  } catch {
    return "generic-gb";
  }
}

export type StudioPhase = "idle" | "parsing" | "ready" | "error";

export function useThesisStudio() {
  const [templateId, setTemplateIdState] = useState(loadTemplateId);
  const [fileName, setFileName] = useState<string | null>(null);
  const [model, setModel] = useState<DocModel | null>(null);
  const [report, setReport] = useState<CheckReport | null>(null);
  const [phase, setPhase] = useState<StudioPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<IssueSeverity | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<IssueCategory | "all">("all");
  const [activeIssueId, setActiveIssueId] = useState<string | null>(null);

  const template = useMemo(() => getTemplate(templateId), [templateId]);

  const setTemplateId = useCallback(
    (id: string) => {
      setTemplateIdState(id);
      try {
        localStorage.setItem(TEMPLATE_STORAGE_KEY, id);
      } catch {
        /* ignore */
      }
      if (model) {
        const next = runChecks(model, getTemplate(id));
        setReport(next);
        setActiveIssueId(next.issues[0]?.id ?? null);
      }
    },
    [model],
  );

  const reset = useCallback(() => {
    setFileName(null);
    setModel(null);
    setReport(null);
    setPhase("idle");
    setError(null);
    setActiveIssueId(null);
  }, []);

  const analyze = useCallback(
    async (file: File) => {
      setPhase("parsing");
      setError(null);
      setFileName(file.name);
      try {
        const parsed = await parseDocx(file, file.name);
        const nextReport = runChecks(parsed, getTemplate(templateId));
        setModel(parsed);
        setReport(nextReport);
        setActiveIssueId(nextReport.issues[0]?.id ?? null);
        setPhase("ready");
      } catch (err) {
        setModel(null);
        setReport(null);
        setPhase("error");
        setError(err instanceof Error ? err.message : "解析失败");
      }
    },
    [templateId],
  );

  const filteredIssues: CheckIssue[] = useMemo(() => {
    if (!report) return [];
    return report.issues.filter((issue) => {
      if (severityFilter !== "all" && issue.severity !== severityFilter) return false;
      if (categoryFilter !== "all" && issue.category !== categoryFilter) return false;
      return true;
    });
  }, [report, severityFilter, categoryFilter]);

  const activeIssue = useMemo(
    () => report?.issues.find((issue) => issue.id === activeIssueId) ?? filteredIssues[0] ?? null,
    [report, activeIssueId, filteredIssues],
  );

  const previewParagraphs = useMemo(() => {
    if (!model) return [];
    if (!activeIssue || activeIssue.paragraphIndex == null) {
      return model.paragraphs.filter((p) => !p.isEmpty).slice(0, 12);
    }
    const center = activeIssue.paragraphIndex;
    const start = Math.max(0, center - 3);
    return model.paragraphs.slice(start, center + 5);
  }, [model, activeIssue]);

  return {
    templates: THESIS_TEMPLATES,
    template,
    templateId,
    setTemplateId,
    fileName,
    model,
    report,
    phase,
    error,
    analyze,
    reset,
    severityFilter,
    setSeverityFilter,
    categoryFilter,
    setCategoryFilter,
    filteredIssues,
    activeIssueId,
    setActiveIssueId,
    activeIssue,
    previewParagraphs,
  };
}
